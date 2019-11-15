import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

import Emoji from "./components/Emoji";
import ReactMarkdown from "react-markdown";
import ScoreBar from "./components/ScoreBar";
import CircularTimer from "./components/CircularTimer";

function Answer({ content, setShowAnswer, meta }) {
    const [clicked, setClicked] = useState(false);
    // Update the `answeredRight` property depending on which button
    // was pressed by the user, and, set the `visited` property to
    // true regardless of which button was clicked.
    const updateState = isCorrect => {
        if (!clicked) {
            meta.setAnsweredRight(isCorrect);
            meta.setVisited(true);
            setClicked(true);
        }
    };

    // Reset the clicked property back to false when the component is unmounted.
    // NOTE: I believe this will work, as soon as, we get the question component working.
    useEffect(() => {
        return () => setClicked(false);
    }, []);

    return (
        <div className="container top-answer">
            <div id="answer-content">
                <ReactMarkdown source={content} />{" "}
            </div>{" "}
            {!meta.visited && !clicked && (
                <div className="controls-container">
                    <div className="controls-flex-container">
                        <div>
                            <button
                                className="controls feedback"
                                onClick={() => updateState(false)}
                            >
                                <Emoji symbol="👎" label="thumbs-up-sign" />
                            </button>{" "}
                        </div>{" "}
                        <div>
                            <button
                                className="controls feedback"
                                onClick={() => updateState(true)}
                            >
                                <Emoji symbol="👍" label="thumbs-down-sign" />
                            </button>{" "}
                        </div>{" "}
                    </div>{" "}
                </div>
            )}{" "}
        </div>
    );
}

function Question({ question, showAnswer, setShowAnswer, setScore, meta }) {
    const { content, timeLimit, index } = question;
    const [time, setTime] = useState(timeLimit);
    const lastestTime = useRef(timeLimit);
    const totalTime = useRef(timeLimit);

    // NOTE: this will run every second.
    useEffect(() => {
        lastestTime.current = time;
    }, [time, meta.index]);

    // NOTE: two questions may have the same timeLimit in a row `timeLimit`
    useEffect(() => {
        totalTime.current = timeLimit;
    }, [timeLimit, meta.index]);

    useEffect(() => {
        return () => {
            setScore(curr => curr * (lastestTime.current / totalTime.current));
        };
    }, [setScore]);

    return (
        <div className="container top-question">
            <div className="small-container">
                <div className="index">
                    <div> {index} </div>{" "}
                </div>{" "}
                <div className="timer">
                    <div>
                        {" "}
                        {!meta.visited && (
                            <CircularTimer
                                time={time}
                                setTime={setTime}
                                finished={showAnswer}
                                timeLimit={timeLimit}
                            />
                        )}{" "}
                    </div>{" "}
                </div>{" "}
            </div>{" "}
            <div id="question-content">
                <div> {content} </div>{" "}
            </div>{" "}
            <div className="button-container">
                <button
                    className="controls feedback"
                    onClick={() => setShowAnswer(true)}
                >
                    SHOW{" "}
                </button>{" "}
            </div>{" "}
        </div>
    );
}

function TopLevelContents({ question, answer, setScore, meta }) {
    const [showAnswer, setShowAnswer] = useState(false);

    const FlashCardAnswer = (
        <Answer setShowAnswer={setShowAnswer} content={answer} meta={meta} />
    );

    // NOTE: flash card question needs show answer because it will tell the timer
    //       when to stop the countdown.
    const FlashCardQuestion = (
        <Question
            question={question}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            setScore={setScore}
            meta={meta}
        />
    );

    // NOTE: manually handling synchronization of the `showAnswer` component
    const [currentRender, setCurrentRender] = useState(FlashCardQuestion);

    useEffect(() => {
        setShowAnswer(false);
    }, [meta.index]);

    useEffect(() => {
        setCurrentRender(showAnswer ? FlashCardAnswer : FlashCardQuestion);
    }, [showAnswer, FlashCardAnswer, FlashCardQuestion]);

    return currentRender;
}

function ButtomLevelContents({ score, meta }) {
    const [currScore, setCurrScore] = useState(0);
    // instead of doing this like this use `answeredRight` instead.
    // Because you shouldn't be giving the score until you know if
    // you have answered right or wrong.
    useEffect(() => {
        if (meta.answeredRight) {
            setCurrScore(c => c + score);
        }
    }, [meta.answeredRight, score]);

    return (
        <div className="container bottom-level">
            <div className="score-container">
                <ScoreBar value={currScore} />{" "}
            </div>{" "}
            <div className="controls-container">
                <div className="prev-control-container">
                    {" "}
                    {meta.index > 0 && (
                        <button
                            className="controls skip"
                            onClick={() => meta.setIndex(curr => curr - 1)}
                        >
                            PREV{" "}
                        </button>
                    )}{" "}
                </div>{" "}
                <div className="skip-control-container">
                    {" "}
                    {meta.index < meta.total - 1 && (
                        <button
                            className="controls skip"
                            onClick={() => meta.setIndex(curr => curr + 1)}
                        >
                            SKIP{" "}
                        </button>
                    )}{" "}
                </div>{" "}
            </div>{" "}
        </div>
    );
}

function FlashCard({ question, answer, meta }) {
    const [score, setScore] = useState(question.score);
    const [correctlyAnswered, setCorrectlyAnswered] = useState(false);

    // Update the `correctlyAnswered` property to false whenever we
    // change to a different flashcard.
    useEffect(() => {
        setCorrectlyAnswered(false);
    }, [meta.index]);

    // Reacts needs y 
    useEffect(() => {
        setScore(question.score);
    }, [question.score]);

    meta = {
        ...meta,
        answeredRight: correctlyAnswered,
        setAnsweredRight: setCorrectlyAnswered
    };

    return (
        <div id="main">
            <div id="top-level">
                <TopLevelContents
                    question={question}
                    answer={answer}
                    setScore={setScore}
                    meta={meta}
                />{" "}
            </div>{" "}
            <div id="bottom-level">
                <ButtomLevelContents score={score} meta={meta} />{" "}
            </div>{" "}
        </div>
    );
}

function StudySession({ url }) {
    const [flashCards, setFlashCards] = useState([
        {
            question: {
                index: 1,
                content: "Example question?",
                score: 12.5,
                timeLimit: 15
            },
            answer: "## Answer\nThis is a demo answer."
        }
    ]);

    // NOTE: here we need to fetch the list of questions from the database.
    //       So we have to write a `useEffect` call which gets updated when-
    //       ever the `url` that gets passed into the study session changes.

    // NOTE: Inside the fetch statement we will use `setFlashCards`.
    useEffect(() => {
        const fetchFlashCards = async path => {
            // get the response from the server and update the value of the `flashCards` property.
            let response = await fetch(path);
            if (response.ok) {
                let flashcards = await response.json();
                setFlashCards(flashcards);
            } else {
                // TODO: handle this better.
                console.error("server did not liked the request.");
            }
        };
        fetchFlashCards(url);
    }, [url]);

    const [flashCardIndex, setFlashCardIndex] = useState(0);
    const [answeredFlashCards, setAnsweredFlashCards] = useState([]);
    const [totalFlashCards, setTotalFlashCards] = useState(flashCards.length);
    const [markedAnswered, setMarkedAnswered] = useState(false);

    // NOTE: I am not sure if this needs to be declared with `useState` my guess
    //       is that it doesn't. Because the properties that this object refers
    //       to are already component state declared using `useState` since the
    //       object stores references whenever the values themselves changes the
    //       metadata object will reflect those changes.

    useEffect(() => {
        setTotalFlashCards(flashCards.length);
    }, [flashCards.length]);

    // This is a convinience method that tells us if the current flashCardIndex has
    // been answered by the user before.
    const hasBeenAnswered = index =>
        answeredFlashCards.length === 0 ||
        index > answeredFlashCards.slice(-1)[0];

    // NOTE: since we are inserting the elements in order the array is sorted. This
    //       means that any index prior to the last value in the array has to have
    //       already been inserted. Hence, there is no need to look in the entire
    //       array if the element is present or not.
    useEffect(() => {
        // Only update the `progressIndex` if the user has answered the question.
        if (markedAnswered) {
            setAnsweredFlashCards(curr => {
                if (curr.length === 0 || flashCardIndex > curr.slice(-1)[0]) {
                    return [...curr, flashCardIndex];
                }
            });
            // NOTE: if we don't set `markedAnswered` here, it will retain its value
            //       of `true` the time the componenent is rendered and will immediately
            //       add the question to the `answeredFlashCards` array.
            setMarkedAnswered(false);
        }
    }, [markedAnswered, setMarkedAnswered, flashCardIndex]);

    const metadata = {
        index: flashCardIndex,
        setIndex: setFlashCardIndex,
        total: totalFlashCards,
        visited: !hasBeenAnswered(flashCardIndex),
        setVisited: setMarkedAnswered
    };

    return (
        <FlashCard
            question={flashCards[flashCardIndex].question}
            answer={flashCards[flashCardIndex].answer}
            meta={metadata}
        />
    );
}

function Main() {
    //"http://localhost:8080/courses/indu/412/"
    return <StudySession url="/courses/indu/412" />;
}

ReactDOM.render(<Main />, document.getElementById("app"));
