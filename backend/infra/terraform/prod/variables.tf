variable "container_image" {
  type        = string
  default     = null
  description = "ECR image for the admin container, including the tag. Empty uses edmp-gdxp-admin-prod-ecr and image_tag."
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Tag pushed to edmp-gdxp-admin-prod-ecr when container_image is empty."
}
