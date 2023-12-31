import React, { useRef, useEffect, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { Box, Button, Text, VStack, Spinner } from "@chakra-ui/react";
import "../Button.css";
import "../Cards.css";
import CardItem from "../CardItem";

export default function Demo() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [keypointsData, setKeypointsData] = useState([]);

  const isPlayingRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const batchesRef = useRef([]);
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState(
    "Welcome - you've taken the first step to improving your wellness!"
  );
  const [exercise, setExercise] = useState(null);

  let countdownInterval;
  let detectionInterval;

  // configure backend
  useEffect(() => {
    async function setupBackend() {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
      } catch (error) {
        console.error("Error setting up TensorFlow backend:", error);
      }
    }
    setupBackend();
  }, []);

  // configure video
  useEffect(() => {
    async function setupCamera() {
      try {
        const video = videoRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          const dpr = window.devicePixelRatio || 1;
          canvasRef.current.style.width = `${video.videoWidth * dpr}px`;
          canvasRef.current.style.height = `${video.videoHeight * dpr}px`;
        };
      } catch (error) {
        console.error("Error setting up the camera:", error);
      }
    }
    setupCamera();
  }, []);

  useEffect(() => {
    async function fetchData(convertedData) {
      const result = await getFeedback(convertedData);
      setFeedback(result["Feedback"]);
      setExercise(result["Exercise"]);
    }
    if (keypointsData.length === 10) {
      const convertedData = convertKeyPointsData(keypointsData);
      fetchData(convertedData);
      setKeypointsData([]);
    }
  }, [keypointsData]);

  const getFeedback = async (posedata) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/getInference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posedata),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "There was a problem with the fetch operation:",
        error.message
      );
    }
  };

  const convertKeyPointsData = (keyPointsData) => {
    return keyPointsData.flat().map((obj) => {
      return {
        y: obj.y,
        x: obj.x,
        score: obj.score,
        name: obj.name,
      };
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawKeypoints = (keypoints) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const adjacentPairs = posedetection.util.getAdjacentPairs(
      posedetection.SupportedModels.MoveNet
    );
    // Draw the keypoints
    keypoints.forEach((keypoint) => {
      const mirroredX = canvas.width - keypoint.x;
      ctx.beginPath();
      ctx.arc(mirroredX, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
    // Draw the lines
    adjacentPairs.forEach((points) => {
      const [startPoint, endPoint] = points.map((p) => keypoints[p]);
      if (startPoint && endPoint) {
        ctx.beginPath();
        ctx.moveTo(canvas.width - startPoint.x, startPoint.y);
        ctx.lineTo(canvas.width - endPoint.x, endPoint.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.stroke();
      }
    });
  };

  console.log("feedback:", feedback);
  console.log("exercise:", exercise);

  // start detecting video
  const startVideoAndDetection = async () => {
    setMessage("Please wait!");
    setIsPlaying(true);
    isPlayingRef.current = true;

    const net = posedetection.SupportedModels.MoveNet;
    const detector = await posedetection.createDetector(net);
    detectionInterval = setInterval(async () => {
      if (!isPlayingRef.current) {
        return;
      }
      const pose = await detector.estimatePoses(videoRef.current);

      if (!pose || !pose.length || pose.length === 0) {
        // No pose detected
        console.log("No subject detected.");
        setFeedback(null);
        setExercise(null);
        // Optional: Add a message to the UI to inform the user
        setMessage("No subject detected. Please ensure you are in the frame.");
        clearCanvas();
        return;
      }

      if (pose.length) {
        setMessage("Analyzing motion.");
        drawKeypoints(pose[0].keypoints);
        setKeypointsData((prevData) => {
          const updatedData = [...prevData, pose[0].keypoints];
          return updatedData;
        });
      }
      //console.log(keypointsData,keypointsData.length)
    }, 50);

    // countdownInterval = setInterval(() => {
    //     if (countdown <= 0 || !isPlayingRef.current) {
    //         clearInterval(countdownInterval);
    //         return;
    //     }
    //     setCountdown(prevCountdown => prevCountdown - 1);
    //     }, 1000);
  };

  const pauseRecording = () => {
    setMessage("You have paused your session");
    setFeedback(null);
    setExercise(null);
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearInterval(detectionInterval);
    clearInterval(countdownInterval);
    clearCanvas();
  };

  const stopRecording = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearInterval(detectionInterval);
    clearInterval(countdownInterval);
    clearCanvas();

    const video = videoRef.current;
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => track.stop());
    setTimeout(() => {
      video.srcObject = null;
    }, 100);
  };

  // const saveCSVToLocalDir = async () => {
  //     let csvContent = "";
  //     keypointsData.forEach(keypoints => {
  //         keypoints.forEach(keypoint => {
  //             const row = [keypoint.name, keypoint.x, keypoint.y, keypoint.score];
  //             csvContent += row.join(",") + "\n";
  //         });
  //     });

  //     const blob = new Blob([csvContent], { type: 'text/csv' });
  //     const url = window.URL.createObjectURL(blob);
  //     const downloadLink = document.createElement('a');

  //     downloadLink.href = url;
  //     downloadLink.download = 'MoveNetData.csv'; // You can name the file whatever you'd like
  //     document.body.appendChild(downloadLink);
  //     downloadLink.click();
  //     document.body.removeChild(downloadLink);
  //     window.URL.revokeObjectURL(url);

  // try {
  //     const response = await fetch('/api/saveCSV', {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ csvData: csvContent }),
  //     });
  //     const data = await response.json();
  //     console.log(data.message);
  //     }
  // catch (error) {
  //     console.error('Error saving CSV:', error);
  // }
  //};

  // const fetchCSVData = async () => {
  //     try {
  //         const response = await fetch('/api/saveCSV', {
  //             method: 'GET',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             }
  //         });
  //         const csvData = await response.text();
  //         console.log(csvData);
  //     }
  //     catch (error) {
  //         console.error('Error fetching CSV:', error);
  //     }
  // };

  // useEffect(() => {
  //     if (countdown <= 0) {
  //         saveCSVToLocalDir();
  //     }
  // }, [countdown]);

  // function generateMessage(armAngle, dropSpeed, elbowAngle, curlSpeed) {
  //     const arm_angle_confidence = `${armAngle}% confident that the forearm is not extended enough on descent`;
  //     const drop_speed_confidence = `${dropSpeed}% confident that the forearm is dropping too quickly`;
  //     const elbow_angle_confidence = `${elbowAngle}% confident that the elbow is raised too high`;
  //     const curl_speed_confidence = `${curlSpeed}% confident that the bicep curl is too fast`;

  //     return arm_angle_confidence + ". " + drop_speed_confidence + ". " + elbow_angle_confidence + ". " + curl_speed_confidence + "."
  // }

  //const userMessage = generateMessage(armAngle, dropSpeed, elbowAngle, curlSpeed);

  // const openai = new OpenAI({
  //         apiKey: "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",
  //         dangerouslyAllowBrowser: true
  //     });

  // async function getFeedback() {
  //     setIsLoading(true);
  //     try {
  //         const response = await openai.chat.completions.create({
  //             model: "gpt-4",
  //             messages: [
  //                 {
  //                 "role": "system",
  //                 "content": "You are an AI that generates feedback on how to do a bicep curl for physical therapy. Based on computer vision results, inform the user if they are doing the exercise correctly or incorrectly. The exercise can be wrong in four ways: the angle between the forearm and upper arm is too small, you raised your elbow too high, you extended your forearm too fast on descent, or you are doing the curl too quickly (implying the weight may be too light). If the algorithm is more than 60% confident that the user is wrong in one of these ways, inform the user how they are performing the exercise wrong. If no confidence rating is above 60%, simply tell the user that they are performing the exercise correctly. Limit your response to 100 words. Do not mention the algorithm at all - act as a personal trainer, not an AI."
  //                 },
  //                 {
  //                 "role": "user",
  //                 "content": userMessage
  //                 }
  //             ],
  //             temperature: 0.91,
  //             max_tokens: 1280,
  //             top_p: 1,
  //             frequency_penalty: 0,
  //             presence_penalty: 0,
  //         });
  //         console.log(response.choices[0].message.content)
  //         setFeedback(response.choices[0].message.content);
  //     } catch (error) {
  //         console.error("Error fetching feedback:", error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // }
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
      position="relative"
    >
      {/* Video and Canvas Section */}
      <Box position="relative" width="1280px" height="960px">
        <video
          ref={videoRef}
          width="1280"
          height="960"
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "ScaleX(-1)",
          }}
        />
        <canvas
          ref={canvasRef}
          width="1280"
          height="960"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {exercise && (
          <img
            src={`images/${exercise}.jpg`}
            alt="yoga position"
            style={{
              position: "absolute",
              top: "100px",
              left: "1000px",
              zIndex: "100",
              width: "250px",
              height: "180px",
            }}
          />
        )}
        <Text
          style={{
            fontFamily:
              "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
          }}
          fontSize="xl"
          position="absolute"
          top="290px"
          left="1050px"
          zIndex="100"
          padding="5px"
          bgColor="rgba(0, 0, 0, 0.5)" // semi-transparent black background
          color="white"
        >
          {exercise}
        </Text>
        <Text
          style={{
            fontFamily:
              "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
          }}
          fontSize="xl"
          position="absolute"
          top="130px"
          left="450px"
          zIndex="100"
          padding="5px"
          bgColor="rgba(0, 0, 0, 0.5)" // semi-transparent black background
          color="white"
          fontFamily="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
            'Lucida Sans', Arial, sans-serif" // you can change this to any font you like
        >
          {message}
        </Text>
        {feedback && (
          <Text
            style={{
              fontFamily:
                "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
            }}
            fontSize="xl"
            position="absolute"
            top="160px"
            left="450px"
            zIndex="100"
            padding="5px"
            bgColor="rgba(0, 0, 0, 0.5)" // semi-transparent black background
            color="white"
            fontFamily="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
            'Lucida Sans', Arial, sans-serif" // you can change this to any font you like
          >
            {feedback}
          </Text>
        )}

        <VStack
          position="absolute"
          top="90px"
          left="10px"
          zIndex="10"
          spacing={5}
        >
          {isPlaying ? (
            <>
              <Button
                colorScheme="teal"
                onClick={pauseRecording}
                className="btn btn--primary btn--large"
              >
                Pause
              </Button>
              {/* <Button 
                        colorScheme="red" ml={3} onClick={stopRecording} className='btn btn--primary btn--large'>
                        Stop
                    </Button> */}
            </>
          ) : (
            <Button
              colorScheme="teal"
              onClick={startVideoAndDetection}
              className="btn btn--primary btn--large"
            >
              Play
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
