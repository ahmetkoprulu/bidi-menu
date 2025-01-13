package impl

import (
	"context"
	"fmt"
	"net/smtp"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
)

type emailService struct {
	config *models.Config
}

func NewEmailService(config *models.Config) services.EmailService {
	return &emailService{
		config: config,
	}
}

func (s *emailService) SendMagicLink(ctx context.Context, magicLink models.MagicLink) error {
	// Create the authentication
	auth := smtp.PlainAuth("", s.config.EmailConfig.SMTPUsername, s.config.EmailConfig.SMTPPassword, s.config.EmailConfig.SMTPHost)

	// Get the appropriate URL and subject based on purpose
	var url, subject, body string
	baseURL := s.config.BaseUrl

	switch magicLink.Purpose {
	case models.MagicLinkPurposeInit:
		url = fmt.Sprintf("%s/auth/setup?token=%s", baseURL, magicLink.Token)
		subject = "Your Magic Link To Complete Your Bidi Account"
		body = fmt.Sprintf("Click the link below to complete your Bidi account: \n\n%s", url)
	default:
		return fmt.Errorf("invalid magic link purpose")
	}

	// Compose the message
	message := []byte(fmt.Sprintf("To: %s\nFrom: %s\nSubject: %s\n\n%s", magicLink.Email, s.config.EmailConfig.FromEmail, subject, body))
	// Send the email
	err := smtp.SendMail(
		s.config.EmailConfig.SMTPHost+":"+s.config.EmailConfig.SMTPPort,
		auth,
		s.config.EmailConfig.FromEmail,
		[]string{magicLink.Email},
		message,
	)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
