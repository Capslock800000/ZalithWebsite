package email

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"html/template"
	"net/smtp"

	"blog-server/config"
)

type Service struct {
	config    *config.SMTPConfig
	templates map[string]*template.Template
}

func NewService(cfg *config.Config) *Service {
	s := &Service{
		config:    &cfg.SMTP,
		templates: make(map[string]*template.Template),
	}

	s.loadTemplates()
	return s
}

func (s *Service) loadTemplates() {
	templates := map[string]string{
		"verify_email":   verifyEmailTemplate,
		"welcome":        welcomeTemplate,
		"password_reset": passwordResetTemplate,
	}

	for name, content := range templates {
		tmpl, err := template.New(name).Parse(content)
		if err != nil {
			continue
		}
		s.templates[name] = tmpl
	}
}

type VerifyEmailData struct {
	Username string
	Code     string
	Link     string
}

type WelcomeData struct {
	Username string
}

type PasswordResetData struct {
	Username string
	Code     string
	Link     string
}

func (s *Service) Send(to, subject, body string) error {
	if s.config.User == "" || s.config.Password == "" {
		return fmt.Errorf("SMTP not configured")
	}

	auth := smtp.PlainAuth("", s.config.User, s.config.Password, s.config.Host)

	msg := fmt.Sprintf("From: %s\r\n", s.config.From)
	msg += fmt.Sprintf("To: %s\r\n", to)
	msg += fmt.Sprintf("Subject: %s\r\n", subject)
	msg += "MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n"
	msg += body

	addr := fmt.Sprintf("%s:%s", s.config.Host, s.config.Port)
	return smtp.SendMail(addr, auth, s.config.From, []string{to}, []byte(msg))
}

func (s *Service) SendTemplate(to, subject, templateName string, data interface{}) error {
	tmpl, ok := s.templates[templateName]
	if !ok {
		return fmt.Errorf("template not found: %s", templateName)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return err
	}

	return s.Send(to, subject, buf.String())
}

func (s *Service) SendVerifyEmail(to string, data *VerifyEmailData) error {
	return s.SendTemplate(to, "Verify Your Email - Zalith Launcher", "verify_email", data)
}

func (s *Service) SendWelcome(to string, data *WelcomeData) error {
	return s.SendTemplate(to, "Welcome to Zalith Launcher", "welcome", data)
}

func (s *Service) SendPasswordReset(to string, data *PasswordResetData) error {
	return s.SendTemplate(to, "Reset Your Password - Zalith Launcher", "password_reset", data)
}

func (s *Service) IsConfigured() bool {
	return s.config.User != "" && s.config.Password != ""
}

func GenerateCode() string {
	b := make([]byte, 3)
	rand.Read(b)
	return hex.EncodeToString(b)
}

const verifyEmailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Zalith Launcher</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi {{.Username}},
                            </p>
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Thank you for registering! Please verify your email address to complete your account setup.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                            <p style="color: #737373; font-size: 14px; margin: 0 0 20px 0;">
                                Your verification code:
                            </p>
                            <div style="background-color: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px 40px; display: inline-block;">
                                <span style="color: #8b5cf6; font-size: 32px; font-weight: 700; letter-spacing: 8px;">{{.Code}}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px; text-align: center;">
                            <p style="color: #737373; font-size: 14px; margin: 0 0 20px 0;">
                                Or click the button below to verify:
                            </p>
                            <a href="{{.Link}}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Verify Email
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px 40px 40px;">
                            <p style="color: #525252; font-size: 13px; line-height: 1.5; margin: 0;">
                                This code will expire in 10 minutes. If you didn't request this verification, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: #525252; font-size: 12px; text-align: center; margin: 0;">
                                Zalith Launcher Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

const welcomeTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Zalith Launcher!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi {{.Username}},
                            </p>
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for joining Zalith Launcher! Your account has been successfully created and verified.
                            </p>
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0;">
                                You can now log in and start exploring our community. Feel free to leave comments on our blog posts and engage with other users.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px 40px 40px; text-align: center;">
                            <a href="https://zalithlauncher.cn/blog" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Visit Our Blog
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: #525252; font-size: 12px; text-align: center; margin: 0;">
                                Zalith Launcher Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

const passwordResetTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi {{.Username}},
                            </p>
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                We received a request to reset your password. Use the code below to proceed:
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                            <div style="background-color: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px 40px; display: inline-block;">
                                <span style="color: #8b5cf6; font-size: 32px; font-weight: 700; letter-spacing: 8px;">{{.Code}}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px; text-align: center;">
                            <p style="color: #737373; font-size: 14px; margin: 0 0 20px 0;">
                                Or click the button below to reset:
                            </p>
                            <a href="{{.Link}}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Reset Password
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px 40px 40px;">
                            <p style="color: #525252; font-size: 13px; line-height: 1.5; margin: 0;">
                                This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: #525252; font-size: 12px; text-align: center; margin: 0;">
                                Zalith Launcher Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
