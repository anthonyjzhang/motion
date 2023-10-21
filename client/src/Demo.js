import React, { useRef, useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { Box, Button, Text, VStack, Spinner } from "@chakra-ui/react";

//import dotenv from 'dotenv
import OpenAI from 'openai';


//dotenv.config()
export default function Test() {
    const videoRef = useRef(null);

    const canvasRef = useRef(null);
    const [keypointsData, setKeypointsData] = useState([]);

    const isPlayingRef = useRef(null);
    const [countdown, setCountdown] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);

    const [feedback, setFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [armAngle, setArmAngle] = useState(Number);
    const [dropSpeed, setDropSpeed] = useState(Number);
    const [elbowAngle, setElbowAngle] = useState(Number);
    const [curlSpeed, setCurlSpeed] = useState(Number);

    let countdownInterval;
    let detectionInterval;

useEffect(() => {
    async function setupBackend() {
        await tf.setBackend('webgl');
        await tf.ready();
    }
  setupBackend();
}, []);

    useEffect(() => {
        async function setupCamera() {
            const video = videoRef.current;

            canvasRef.current.width = video.width;
            canvasRef.current.height = video.height;
            const stream = await navigator.mediaDevices.getUserMedia({ 'video': true });
            video.srcObject = stream;
            video.play();
        }
        setupCamera();
}, []);

const drawKeypoints = (keypoints) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

ctx.clearRect(0, 0, canvas.width, canvas.height);

// Define the keypoint connections
const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, 0.5);

// Draw the keypoints
keypoints.forEach(keypoint => {
    ctx.beginPath();
    ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
});

// Draw the lines
adjacentKeyPoints.forEach(points => {
    ctx.beginPath();
    ctx.moveTo(points[0].position.x, points[0].position.y);
    ctx.lineTo(points[1].position.x, points[1].position.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();
});
};

const startVideoAndDetection = async () => {
    setIsPlaying(true);
    isPlayingRef.current = true;

    const net = await posenet.load();
    detectionInterval = setInterval(async () => {
        if (!isPlayingRef.current) {
            return;
        }
        const pose = await net.estimateSinglePose(videoRef.current);
        console.log(pose.keypoints);
        
        drawKeypoints(pose.keypoints);
        setKeypointsData(prevData => [...prevData, pose.keypoints]);
    }, 1000/30);

    countdownInterval = setInterval(() => {
        if (countdown <= 0 || !isPlayingRef.current) {
            clearInterval(countdownInterval);
            return;
        }
        setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);
    };

    const pauseRecording = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        clearInterval(detectionInterval);
        clearInterval(countdownInterval);
    };

    const stopRecording = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        clearInterval(detectionInterval);
        clearInterval(countdownInterval);
    const video = videoRef.current;
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;

    saveCSVToLocalDir();
};

const saveCSVToLocalDir = async () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    keypointsData.forEach(keypoints => {
        keypoints.forEach(keypoint => {
            const row = [keypoint.part, keypoint.position.x, keypoint.position.y];
            csvContent += row.join(",") + "\n";
        });
    });

    try {
        const response = await fetch('/api/saveCSV', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvData: csvContent }),
        });
        const data = await response.json();
        console.log(data.message);
        } 
    catch (error) {
        console.error('Error saving CSV:', error);
    }
    };

// const fetchCSVData = async () => {
//     try {
//         const response = await fetch('/api/saveCSV', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ csvData: csvContent }),
//         });
//         const csvData = await response.text();
//         console.log(csvData);
//     } 
//     catch (error) {
//         console.error('Error fetching CSV:', error);
//     }
//     };

const fetchCSVData = async () => {
    try {
      const response = await fetch('/api/saveCSV', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const csvData = await response.text();
      console.log(csvData);
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  };

useEffect(() => {
    if (countdown <= 0) {
        saveCSVToLocalDir();
    }
    }, [countdown]);

function generateMessage(armAngle, dropSpeed, elbowAngle, curlSpeed) {
    const arm_angle_confidence = `${armAngle}% confident that the forearm is not extended enough on descent`;
    const drop_speed_confidence = `${dropSpeed}% confident that the forearm is dropping too quickly`;
    const elbow_angle_confidence = `${elbowAngle}% confident that the elbow is raised too high`;
    const curl_speed_confidence = `${curlSpeed}% confident that the bicep curl is too fast`;

    return arm_angle_confidence + ". " + drop_speed_confidence + ". " + elbow_angle_confidence + ". " + curl_speed_confidence + "."
}

const userMessage = generateMessage(armAngle, dropSpeed, elbowAngle, curlSpeed);

const openai = new OpenAI({
        apiKey: "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",
        dangerouslyAllowBrowser: true
    });
    
    async function getFeedback() {
        setIsLoading(true);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                    "role": "system",
                    "content": "You are an AI that generates feedback on how to do a bicep curl for physical therapy. Based on computer vision results, inform the user if they are doing the exercise correctly or incorrectly. The exercise can be wrong in four ways: the angle between the forearm and upper arm is too small, you raised your elbow too high, you extended your forearm too fast on descent, or you are doing the curl too quickly (implying the weight may be too light). If the algorithm is more than 60% confident that the user is wrong in one of these ways, inform the user how they are performing the exercise wrong. If no confidence rating is above 60%, simply tell the user that they are performing the exercise correctly. Limit your response to 100 words. Do not mention the algorithm at all - act as a personal trainer, not an AI."
                    },
                    {
                    "role": "user",
                    "content": userMessage
                    }
                ],
                temperature: 0.91,
                max_tokens: 1280,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            console.log(response.choices[0].message.content)
            setFeedback(response.choices[0].message.content);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <Box p={5} display="flex" flexDirection="column" height="100vh">
    
        {/* Video and Canvas Section */}
        <Box flex="6" display="flex" alignItems="flex-start" marginBottom={5}>
            <Box flex="1" marginRight={5} display="flex" flexDirection="column" alignItems="flex-start" position="relative">
            <video ref={videoRef} width="1280" height="960" playsInline style={{ position: 'absolute', top: 0, left: 0 }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
            <Text fontSize="xl" marginTop={3}>Time Remaining: {countdown >= 0 ? countdown : 0} seconds</Text>
            </Box>
            <VStack flex="2" spacing={5}>
            {isPlaying ? (
                <>
                <Button colorScheme="teal" onClick={pauseRecording}>
                    Pause
                </Button>
                <Button colorScheme="red" ml={3} onClick={stopRecording}>
                    Stop
                </Button>
                </>
            ) : (
                <Button colorScheme="teal" onClick={startVideoAndDetection}>
                Play
                </Button>
            )}
            <Button ml={3} onClick={fetchCSVData}>
                Fetch CSV Data
            </Button>
            </VStack>
        </Box> 
        <Box flex="4" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Button ml={3} onClick={getFeedback}>
                Check Feedback
            </Button>
            <Box width="100%" p={5} marginTop={3} boxShadow="xl" borderRadius="md" bg="white" position="relative">
            {isLoading ? (
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                <Spinner size="xl" />
                </Box>
            ) : (
                <Text fontSize="md">{feedback}</Text>
            )}
            </Box>
        </Box>
    
        </Box>
    );
    
}