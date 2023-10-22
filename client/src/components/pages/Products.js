import React from 'react';
import styled from 'styled-components';
import '../../App.css';

const VideoBackground = styled.video`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
`;

const PageContainer = styled.div`
    padding: 50px 15%;
    font-family: 'Arial', sans-serif;
    color: #333;
    position: relative;
    background-color: rgba(255, 255, 255, 0.3);  // semi-transparent white background
`;


const Section = styled.section`
    margin-bottom: 50px;
    background: rgba(255, 255, 255, 0.7); // Adjusted transparency here
    padding: 20px 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;


const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
`;

const Subtitle = styled.h2`
    font-size: 2rem;
    margin: 20px 0;
`;

const Text = styled.p`
    font-size: 1.2rem;
    line-height: 1.5;
    color: #666;
`;

const List = styled.ul`
    list-style: disc inside;
    font-size: 1.2rem;
    line-height: 1.5;
    color: #666;
`;

const ListItem = styled.li`
    margin-bottom: 10px;
`;

export default function Products() {
  return (
      <PageContainer>
          <VideoBackground src='/videos/video-4.mp4' autoPlay loop muted />
          <Section>
              <Title>AI Yoga Instructor: Our Journey</Title>
              <Text>
                We embarked on an exciting journey during the Harvard Hackathon to build an AI Yoga Instructor. Our vision was to leverage the power of artificial intelligence to provide real-time, personalized yoga instructions to individuals worldwide. We saw an opportunity to make yoga more accessible, and with the advancements in machine learning and computer vision, our idea seemed not only feasible but groundbreaking.
              </Text>
          </Section>

          <Section>
              <Subtitle>Challenges Faced</Subtitle>
              <Text>
                During the hackathon, we encountered several challenges that tested our skills and perseverance. Integrating the AI model with real-time video streams was a major hurdle, as we needed to ensure smooth feedback without lags. Additionally, training our model to recognize and distinguish between numerous yoga postures, especially the nuanced ones, proved to be a complex task. Nonetheless, with dedication and countless hours of debugging, we overcame these challenges.
              </Text>
          </Section>

          <Section>
              <Subtitle>Technical Details</Subtitle>
              <List>
                  <ListItem>
                    <strong>AI Model:</strong> We utilized a convolutional neural network (CNN) trained on thousands of yoga postures to detect and evaluate user performance. With this model, our system can provide real-time feedback and suggestions to the user.
                  </ListItem>
                  <ListItem>
                    <strong>Real-time Feedback:</strong> We implemented WebRTC to capture live video streams, which are then processed and analyzed by our AI model. This allows for instantaneous feedback, guiding users to achieve the correct posture and alignment.
                  </ListItem>
              </List>
          </Section>
          
      </PageContainer>
  );
}
