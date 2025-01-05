package models

type ClientRole string
type ClientStatus string
type MenuStatus string

const (
	ClientStatusActive   ClientStatus = "active"
	ClientStatusInactive ClientStatus = "inactive"
	ClientStatusTrial    ClientStatus = "trial"
)

const (
	MenuStatusActive   MenuStatus = "active"
	MenuStatusInactive MenuStatus = "inactive"
)
