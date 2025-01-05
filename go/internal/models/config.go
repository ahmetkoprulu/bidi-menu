package models

type Config struct {
	DatabaseURL  string
	DatabaseName string
	MqURL        string
	CacheURL     string
	ElasticUrl   string
	JWTSecret    string
	ServiceName  string
	ServerPort   string
	APIBaseURL   string
}
