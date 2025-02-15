package utils

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *Loggger

type Loggger struct {
	*zap.Logger
}

func InitLogger() {
	config := zap.NewProductionConfig()
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	var err error
	zapLogger, err := config.Build()
	Logger = &Loggger{zapLogger}
	if err != nil {
		panic(err)
	}
}

func (l *Loggger) String(key string, value string) zap.Field {
	return zap.String(key, value)
}
