package main

import (
    "log"
    "math/rand"
    _ "rsc.io/sqlite"
    "database/sql"
    "net/http"
    "github.com/gin-gonic/gin"
)

type (
    FlashCardQuestion struct {
        Index int32 `json:"index"`
        Content string `json:"content"`
        Time int32 `json:"timeLimit"`
        Score float64 `json:"score"`
    }

    FlashCard struct {
        Answer string `json:"answer"`
        Question FlashCardQuestion `json:"question"`
    }
)

/*
    // Now we will append things to the list
    flashCards = append(flashCards, FlashCard {
        Answer: "## Answer\nThis is an example answer, answers in *Flashcards* allow for `markdown`-syntax which allows you to write expressive answers.\n- Example 1\n- Example 2",
        Question: FlashCardQuestion {
            Index: 1,
            Content: "This is an example question?",
            Time: 30.0,
            Score: 100,
        },
    });
*/

func AccumulateScore(cards []FlashCard) float64 {
    totalScore := 0.0
    for _, card := range(cards) {
        totalScore += card.Question.Score
    }

    return totalScore;
}

// Let's start by creating an in-memory server of the data.
func ServeContent(db *sql.DB, courseID int32) func (*gin.Context) {
    // We will need a list of `FlashCard` items which contains 
    var flashCards []FlashCard;

    // Prepare a statement to fetch all the rows from the `flashcards` table.
    rows, err := db.Query(`
    SELECT id, question, answer, score, time FROM flashcards WHERE course_id = ?;
    `, courseID);

    if err != nil {
        log.Fatalf("failed to retrieve values from the database: %s", err.Error())
    }

    var card FlashCard

    for rows.Next() {
        rows.Scan(
            &card.Question.Index,
            &card.Question.Content,
            &card.Answer,
            &card.Question.Score,
            &card.Question.Time,
        )

        flashCards = append(flashCards, card)
    }

    // normalize the scores of each question.
    totalScore := AccumulateScore(flashCards);
    for idx := range(flashCards) {
        flashCards[idx].Question.Score /= totalScore
        flashCards[idx].Question.Score *= 100.0
    }

    // shuffle the `flashCards` array.
    for i := range(flashCards) {
        j := rand.Intn(i + 1);
        flashCards[i], flashCards[j] = flashCards[j], flashCards[i];
    }

    return func (c *gin.Context) {
        c.JSON(http.StatusOK, flashCards);
    }
}

func Init() *sql.DB {
    var db, err = sql.Open("sqlite3", "./database/flashcards.db")
    if err != nil {
        log.Fatalf("can't open database: %s", err.Error())
    }
    return db
}

func main() {
    // open the database from which we will get the flashcards from.
    // for now, since we are not handling `POST` request all of our data is already inside the database.
    // furthermore, since there are no users we don't need to worry about validation.
    conn := Init()
    // this makes sure the database is closed once the server stops running.
    defer conn.Close()
    // start the webserver and add `CORS` middleware to ensure the application works as intended.
    router := gin.Default()
    // TODO: research how properly implement this...
    router.Use(CORSMiddleware())
    // here we route based requested courseID
    router.GET("/courses/indu/412", ServeContent(conn, 412))
    router.Run(":8080")
}


func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET")
        c.Next()
    }
}
