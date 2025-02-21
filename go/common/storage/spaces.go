package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
)

type spacesService struct {
	client *s3.Client
	config models.SpacesConfig
}

func NewSpacesService(config models.SpacesConfig) (StorageService, error) {
	resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: config.Endpoint,
		}, nil
	})

	cfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithEndpointResolverWithOptions(resolver),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			config.AccessKeyID,
			config.SecretAccessKey,
			"",
		)),
		awsconfig.WithRegion(config.Region),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	client := s3.NewFromConfig(cfg)
	return &spacesService{
		client: client,
		config: config,
	}, nil
}

func (s *spacesService) SaveGlbModel(file *multipart.FileHeader, modelID uuid.UUID) (string, error) {
	if file.Size > MaxFileSize {
		return "", ErrFileTooLarge
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !isAllowedFormat(ext, AllowedGlbFormats) {
		return "", ErrInvalidFormat
	}

	filename := fmt.Sprintf("%s%s", modelID.String(), ext)
	path := fmt.Sprintf("models/glb/%s", filename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.config.Bucket),
		Key:         aws.String(path),
		Body:        src,
		ContentType: aws.String("model/gltf-binary"),
		ACL:         types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return "", err
	}

	return path, nil
}

func (s *spacesService) SaveUsdzModel(file *multipart.FileHeader, modelID uuid.UUID) (string, error) {
	if file.Size > MaxFileSize {
		return "", ErrFileTooLarge
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !isAllowedFormat(ext, AllowedUsdzFormats) {
		return "", ErrInvalidFormat
	}

	filename := fmt.Sprintf("%s%s", modelID.String(), ext)
	path := fmt.Sprintf("models/usdz/%s", filename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.config.Bucket),
		Key:         aws.String(path),
		Body:        src,
		ContentType: aws.String("model/vnd.usdz+zip"),
		ACL:         types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return "", err
	}

	return path, nil
}

func (s *spacesService) SaveThumbnail(file *multipart.FileHeader, modelID uuid.UUID) (string, error) {
	if file.Size > MaxFileSize {
		return "", ErrFileTooLarge
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !isAllowedFormat(ext, AllowedImageFormats) {
		return "", ErrInvalidFormat
	}

	filename := fmt.Sprintf("%s%s", modelID.String(), ext)
	path := fmt.Sprintf("thumbnails/%s", filename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.config.Bucket),
		Key:         aws.String(path),
		Body:        src,
		ContentType: aws.String(fmt.Sprintf("image/%s", strings.TrimPrefix(ext, "."))),
		ACL:         types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return "", err
	}

	return path, nil
}

func (s *spacesService) DeleteGlbModel(modelID uuid.UUID) error {
	// Try to delete with all possible extensions
	for _, ext := range AllowedGlbFormats {
		path := fmt.Sprintf("models/glb/%s%s", modelID.String(), ext)
		_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(s.config.Bucket),
			Key:    aws.String(path),
		})
		if err == nil {
			return nil
		}
	}
	return nil // Don't return error if file doesn't exist
}

func (s *spacesService) DeleteUsdzModel(modelID uuid.UUID) error {
	// Try to delete with all possible extensions
	for _, ext := range AllowedUsdzFormats {
		path := fmt.Sprintf("models/usdz/%s%s", modelID.String(), ext)
		_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(s.config.Bucket),
			Key:    aws.String(path),
		})
		if err == nil {
			return nil
		}
	}
	return nil
}

func (s *spacesService) DeleteThumbnail(modelID uuid.UUID) error {
	// Try to delete with all possible extensions
	for _, ext := range AllowedImageFormats {
		path := fmt.Sprintf("thumbnails/%s%s", modelID.String(), ext)
		_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(s.config.Bucket),
			Key:    aws.String(path),
		})
		if err == nil {
			return nil
		}
	}
	return nil
}

func (s *spacesService) GetPublicGlbPath(modelID uuid.UUID) string {
	return fmt.Sprintf("%s/models/glb/%s", s.config.CDNDomain, modelID.String())
}

func (s *spacesService) GetPublicUsdzPath(modelID uuid.UUID) string {
	return fmt.Sprintf("%s/models/usdz/%s", s.config.CDNDomain, modelID.String())
}

func (s *spacesService) GetPublicThumbnailPath(modelID uuid.UUID) string {
	return fmt.Sprintf("%s/thumbnails/%s", s.config.CDNDomain, modelID.String())
}
