package main

import (
    _ "database/sql"
    "net/http"
    "github.com/gin-gonic/gin"
)

type (
    FlashCardQuestion struct {
        Index int32 `json:"index"`
        Content string `json:"content"`
        Time float64 `json:"timeLimit"`
        Score int32 `json:"score"`
    }

    FlashCard struct {
        Answer string `json:"answer"`
        Question FlashCardQuestion `json:"question"`
    }
)


// Let's start by creating an in-memory server of the data.
func ServeContent(courseID int32) func (*gin.Context) {
    // We will need a list of `FlashCard` items which contains 
    var flashCards []FlashCard;


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

    return func (c *gin.Context) {
        c.JSON(http.StatusOK, flashCards);
    }
}

func Init() {
}

func main() {
    router := gin.Default()
    router.Use(CORSMiddleware());
    // Here we would write something like.
    router.GET("/courses/indu/412", ServeContent(412))
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
