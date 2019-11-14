package main

import (
    "fmt"
    "database/sql"
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

func ServeContent(courseID int32) func (*gin.Context) {

    return func (c *gin.Context) {
    }
}

func Init() {
}

func main() {
    router := gin.Default()
    router.GET("/", func (ctx *gin.Context) {
        fmt.Fprintln(ctx.Writer, "Hello World")
    })

    // Here we would write something like.

    router.Run()
}
