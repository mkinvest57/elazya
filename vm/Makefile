# Elazya VM Image Builder
# Creates a minimal Alpine Linux disk image with Node.js runtime
# for use with Apple Virtualization Framework.
#
# Requirements: Docker (for building), qemu-img (for disk image)
# Output: vmlinuz, initrd, elazya-rootfs.img
#
# Usage:
#   make all       — Build everything
#   make kernel    — Extract kernel and initrd
#   make rootfs    — Build root filesystem image
#   make install   — Copy VM files to ~/Library/Application Support/Elazya/VM/
#   make clean     — Remove build artifacts

.PHONY: all kernel rootfs install clean

DOCKER_IMAGE := elazya-vm-builder
VM_DIR := $(HOME)/Library/Application\ Support/Elazya/VM
DISK_SIZE := 8G
BUILD_DIR := build

all: kernel rootfs

# --- Build the Docker image used to create the VM filesystem ---
docker-build:
	@echo ">>> Building Docker image for VM filesystem..."
	docker build -t $(DOCKER_IMAGE) -f Dockerfile.vm .

# --- Extract Linux kernel and initrd from the container ---
kernel: docker-build
	@mkdir -p $(BUILD_DIR)
	@echo ">>> Extracting kernel and initrd..."
	docker create --name elazya-vm-extract $(DOCKER_IMAGE) true
	docker cp elazya-vm-extract:/boot/vmlinuz $(BUILD_DIR)/vmlinuz
	docker cp elazya-vm-extract:/boot/initrd $(BUILD_DIR)/initrd
	docker rm elazya-vm-extract
	@echo ">>> Kernel: $(BUILD_DIR)/vmlinuz"
	@echo ">>> Initrd: $(BUILD_DIR)/initrd"

# --- Build root filesystem disk image ---
rootfs: docker-build
	@mkdir -p $(BUILD_DIR)
	@echo ">>> Exporting container filesystem to tar..."
	docker create --name elazya-vm-rootfs $(DOCKER_IMAGE) true
	docker export elazya-vm-rootfs > $(BUILD_DIR)/rootfs.tar
	docker rm elazya-vm-rootfs
	@echo ">>> Building ext4 disk image (2GB sparse)..."
	docker run --privileged --rm -v $$(pwd)/$(BUILD_DIR):/build alpine:3.20 sh -c "\
		apk add --no-cache e2fsprogs && \
		dd if=/dev/zero of=/build/elazya-rootfs.img bs=1M count=0 seek=2048 && \
		mkfs.ext4 -F /build/elazya-rootfs.img && \
		mkdir -p /mnt && mount -o loop /build/elazya-rootfs.img /mnt && \
		tar -xf /build/rootfs.tar -C /mnt && \
		umount /mnt"
	rm $(BUILD_DIR)/rootfs.tar
	@echo ">>> Compressing disk image to save space..."
	gzip -cf $(BUILD_DIR)/elazya-rootfs.img > $(BUILD_DIR)/rootfs.img.gz
	@echo ">>> Root FS Compressed: $(BUILD_DIR)/rootfs.img.gz"

# --- Install VM files to Application Support ---
install: all
	@echo ">>> Installing VM files..."
	@mkdir -p $(VM_DIR)
	cp $(BUILD_DIR)/vmlinuz $(VM_DIR)/
	cp $(BUILD_DIR)/initrd $(VM_DIR)/
	cp $(BUILD_DIR)/elazya-rootfs.img $(VM_DIR)/
	@echo ">>> Installed to $(VM_DIR)"

# --- Clean build artifacts ---
clean:
	rm -rf $(BUILD_DIR)
	docker rmi $(DOCKER_IMAGE) 2>/dev/null || true
	@echo ">>> Cleaned."
