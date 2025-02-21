package models

type Config struct {
	DatabaseURL   string
	DatabaseName  string
	MqURL         string
	CacheURL      string
	ElasticUrl    string
	JWTSecret     string
	ServiceName   string
	ServerPort    string
	BaseUrl       string
	TesseractPath string
	EmailConfig   EmailConfig
	SpacesConfig  SpacesConfig
}

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
}

type SpacesConfig struct {
	Region          string
	Bucket          string
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	CDNDomain       string
}
