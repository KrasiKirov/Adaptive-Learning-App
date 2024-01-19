import React, { useState, useEffect } from 'react';
import '../Question2.css';
import { updateRatings } from './elo';
import { useQuizSettings } from '../QuizContext';
import { useUser } from '../UserContext';

const Question2 = () => {
  const { quizSettings, setQuizSettings } = useQuizSettings();
  const { user } = useUser();

  const [randomQuestion, setRandomQuestion] = useState({
    question: '',
    answers: [],
    correctAnswer: '',
    feedback: '',
    score: 0,
    subject: '',
    lastDisplayedQuestion: '',
  });

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [elo, setUserElo] = useState(15); // Initial User Elo
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answeredQuestionsHistory, setAnsweredQuestionsHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, [quizSettings.difficulty, quizSettings.subject, elo]); // Rerun when quiz settings or elo change

  const setInitialBounds = (difficulty, elo) => {
    let lowerBound;
    let higherBound;
    const multiplier = 0.2;

    switch (difficulty) {
      case 'easy':
        lowerBound = elo - Math.round(elo * 2 * multiplier);
        higherBound = elo;
        break;
      case 'medium':
        lowerBound = Math.round(elo - elo * multiplier);
        higherBound = Math.round(elo + elo * multiplier);
        break;
      case 'hard':
        lowerBound = elo;
        higherBound = Math.round(elo + elo * multiplier * 2);
        break;
      default:
        lowerBound = 0;
        higherBound = 1000;
        break;
    }
    return { lowerBound, higherBound };
  };

  const fetchData = async () => {
    const { lowerBound, higherBound } = setInitialBounds(quizSettings.difficulty, elo);
    try {
      const response = await fetch('http://localhost:3000/question2');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const questionsData = await response.json();
      console.log(questionsData);

      const filteredQuestions = questionsData.filter(
        (item) =>
          item.score >= lowerBound &&
          item.score <= higherBound
      );

      console.log(filteredQuestions);

      

      if (filteredQuestions.length > 0) {
        let randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        setRandomQuestion(filteredQuestions[randomIndex]);
        const randomQuestionData = filteredQuestions[randomIndex];
        const question = randomQuestionData.question;
        const answers = [
          randomQuestionData.answer1,
          randomQuestionData.answer2,
          randomQuestionData.answer3,
          randomQuestionData.answer4,
        ];
        const correctAnswer = randomQuestionData.correctAnswer;
        const feedback = randomQuestionData.feedback;
        const score = randomQuestionData.score;
        const subject = randomQuestionData.subject;

        setRandomQuestion({
          question,
          answers,
          correctAnswer,
          feedback,
          score,
          subject,
          lastDisplayedQuestion: question,
        });
      } else {
        setRandomQuestion({
          question: '',
          answers: [],
          correctAnswer: '',
          feedback: '',
          score: 0,
          subject: '',
          lastDisplayedQuestion: '',
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      alert('Please select an answer before submitting.');
      return;
    }

    const result = selectedAnswer === randomQuestion.correctAnswer ? 1 : 0;
    const updatedUserElo = updateRatings(elo, randomQuestion.score, result, quizSettings.difficulty);

    setUserElo(updatedUserElo);
    setAnswerSubmitted(true);
    setShowFeedback(result ? `Good Job! Your new ELO: ${updatedUserElo}` : 'Wrong Answer: ' + randomQuestion.feedback);
    setAnsweredQuestionsHistory(prev => [...prev, randomQuestion.question]);
    fetchData(); // Refetch the data to get a new question
  };

  const handleButtonClick = (type) => {
    setQuizSettings((prevSettings) => ({
      ...prevSettings,
      difficulty: type === 'harder' ? 'hard' : type === 'easier' ? 'easy' : 'medium'
    }));
    fetchData();
  };

  return (
    <div className="container">
      {randomQuestion.question ? (
        <>
          <div className="question-container">
            <h1>{randomQuestion.question}</h1>
          </div>
          <div className="level-elo-container">
            <p>Level: {randomQuestion.score}</p>
            <p>Your ELO: {elo}</p>
          </div>
          <div className="answers-container">
            {randomQuestion.answers.map((answer, index) => (
              <button
                key={index}
                className={`answer ${selectedAnswer === answer ? 'selected' : ''}`}
                onClick={() => handleAnswerSelection(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
          <div className="submit-container">
            <button className="submit-button" onClick={handleSubmitAnswer} disabled={answerSubmitted}>
              Submit Answer
            </button>
          </div>
          {showFeedback && (
            <div className="feedback">
              <p>{showFeedback}</p>
            </div>
          )}
          <div className="center-buttons">
            <button onClick={() => handleButtonClick('harder')}>Harder Question</button>
            <button onClick={() => handleButtonClick('easier')}>Easier Question</button>
            <button onClick={() => handleButtonClick('similar')}>Similar Question</button>
          </div>
        </>
      ) : (
        <p>No questions available at the moment.</p>
      )}
    </div>
  );
};

export default Question2;
