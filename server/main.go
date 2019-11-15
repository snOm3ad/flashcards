package main

import (
    "log"
    "time"
    "math/rand"
    "database/sql"
    _ "rsc.io/sqlite"
    "net/http"
    "github.com/gin-gonic/gin"
)

type (
    FlashCardQuestion struct {
        Index int32 `json:"index"`
        Content string `json:"content"`
        Score float64 `json:"score"`
        Time int32 `json:"timeLimit"`
    }

    FlashCard struct {
        Question FlashCardQuestion `json:"question"`
        Answer string `json:"answer"`
    }
)

func AccumulateScore(cards []FlashCard) float64 {
    totalScore := 0.0
    for _, card := range(cards) {
        totalScore += card.Question.Score
    }

    return totalScore;
}

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
        // get all the elements specified in the query above. 
        rows.Scan(
            &card.Question.Index,
            &card.Question.Content,
            &card.Answer,
            &card.Question.Score,
            &card.Question.Time,
        )

        // append the current row to the array.
        flashCards = append(flashCards, card)
    }

    // normalize the scores of each question so that the maximum score is 100%
    totalScore := AccumulateScore(flashCards);
    for idx := range(flashCards) {
        flashCards[idx].Question.Score /= totalScore
        flashCards[idx].Question.Score *= 100.0
    }

    // NOTE: this implies that we have a different seed everytime the server is runned
    //       not every time the user makes a request. imo, this should introduce enough
    //       randomness into the feature.
    rand.Seed(time.Now().UTC().UnixNano())

    return func (c *gin.Context) {
        // look at for more info https://stackoverflow.com/questions/12264789/shuffle-array-in-go
        for i := range(flashCards) {
            j := rand.Intn(i + 1)
            flashCards[i], flashCards[j] = flashCards[j], flashCards[i]
        }

        // re-assing the indices, note that is what not possible to do this above.
        for i := range(flashCards) {
            flashCards[i].Question.Index = int32(i + 1);
        }

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
