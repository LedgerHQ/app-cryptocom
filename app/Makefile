#*******************************************************************************
#   Ledger App
#   (c) 2023 Ledger
#   (c) 2021 CRO Protocol Labs ("Crypto.org")
#   (c) 2018-2020 Zondax GmbH
#   (c) 2017 Ledger
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#*******************************************************************************

ifeq ($(BOLOS_SDK),)
$(error BOLOS_SDK is not set)
endif

include $(BOLOS_SDK)/Makefile.defines

# Main app configuration
APPNAME = "Crypto.org Chain"
APPVERSION_M=2
APPVERSION_N=17
APPVERSION_P=0

APPPATH = "44'/394'"
ifeq ($(TARGET_NAME),TARGET_NANOX)
APP_LOAD_PARAMS = --appFlags 0x200
else
APP_LOAD_PARAMS = --appFlags 0x000
endif
APP_LOAD_PARAMS += --delete $(COMMON_LOAD_PARAMS) --path $(APPPATH) --curve secp256k1


ifeq ($(TARGET_NAME),TARGET_NANOS)
APP_STACK_SIZE:=1212
ICONNAME:=$(CURDIR)/icons/nanos_icon.gif
else ifeq ($(TARGET_NAME),TARGET_STAX)
ICONNAME:=$(CURDIR)/icons/stax_icon.gif
else
ICONNAME:=$(CURDIR)/icons/nanox_icon.gif
endif


ifndef ICONNAME
$(error ICONNAME is not set)
endif

DEVICE_NAME := $(shell echo $(TARGET_NAME) | cut -d'_' -f2 | tr '[:upper:]' '[:lower:]')
all: default
	@mkdir -p $(CURDIR)/pkg
	@echo "#!/usr/bin/env bash" > $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "APPNAME=\""${APPNAME}"\"" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "APPVERSION=\"${APPVERSION}\"" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "APPPATH=\""${APPPATH}"\"" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "LOAD_PARAMS=($$(echo "${APP_LOAD_PARAMS}" | sed -e "s|"${APPNAME}"|\""${APPNAME}"\"|"))" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "DELETE_PARAMS=($$(echo "${COMMON_DELETE_PARAMS}" | sed -e "s|"${APPNAME}"|\""${APPNAME}"\"|"))" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "APPHEX=\"" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@cat $(CURDIR)/bin/app.hex >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@echo "\"" >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@cat $(CURDIR)/../deps/ledger-zxlib/scripts/template.sh >> $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh
	@chmod +x $(CURDIR)/pkg/${DEVICE_NAME}_installer.sh

############
# Platform

DEFINES 	  += REVIEW_SCREEN_ENABLED # zxlib : enable nanos "please review" screen. 

DEFINES       += UNUSED\(x\)=\(void\)x

DEFINES       += APPNAME=\"$(APPNAME)\"

APPVERSION=$(APPVERSION_M).$(APPVERSION_N).$(APPVERSION_P)
DEFINES       += APPVERSION=\"$(APPVERSION)\"

DEFINES       += OS_IO_SEPROXYHAL
DEFINES       += HAVE_SPRINTF
DEFINES       += HAVE_IO_USB HAVE_L4_USBLIB IO_USB_MAX_ENDPOINTS=7 IO_HID_EP_LENGTH=64 HAVE_USB_APDU

DEFINES       += LEDGER_MAJOR_VERSION=$(APPVERSION_M) LEDGER_MINOR_VERSION=$(APPVERSION_N) LEDGER_PATCH_VERSION=$(APPVERSION_P)

DEFINES       += USB_SEGMENT_SIZE=64
DEFINES       += HAVE_BOLOS_APP_STACK_CANARY

DEFINES       += HAVE_WEBUSB WEBUSB_URL_SIZE_B=0 WEBUSB_URL=""

# Bluetooth
ifeq ($(TARGET_NAME),$(filter $(TARGET_NAME),TARGET_NANOX TARGET_STAX))
DEFINES   += HAVE_BLE BLE_COMMAND_TIMEOUT_MS=2000 HAVE_BLE_APDU
endif

ifeq ($(TARGET_NAME),TARGET_NANOS)
    DEFINES       += IO_SEPROXYHAL_BUFFER_SIZE_B=128
else ifeq ($(TARGET_NAME),TARGET_STAX)
	DEFINES       += IO_SEPROXYHAL_BUFFER_SIZE_B=300
	DEFINES       += NBGL_QRCODE
else
    DEFINES       += IO_SEPROXYHAL_BUFFER_SIZE_B=300
    DEFINES       += HAVE_GLO096
    DEFINES       += BAGL_WIDTH=128 BAGL_HEIGHT=64
    DEFINES       += HAVE_BAGL_ELLIPSIS # long label truncation feature
    DEFINES       += HAVE_BAGL_FONT_OPEN_SANS_REGULAR_11PX
    DEFINES       += HAVE_BAGL_FONT_OPEN_SANS_EXTRABOLD_11PX
    DEFINES       += HAVE_BAGL_FONT_OPEN_SANS_LIGHT_16PX
	DEFINES       += HAVE_UX_FLOW
endif

# Both nano S and X benefit from the flow.
ifneq ($(TARGET_NAME),TARGET_STAX)
	DEFINES   += HAVE_BAGL
endif

# Enabling debug PRINTF
DEBUG = 0
ifneq ($(DEBUG),0)
        ifeq ($(TARGET_NAME),TARGET_NANOS)
                DEFINES   += DEVEL HAVE_PRINTF PRINTF=screen_printf
        else
                DEFINES   += DEVEL HAVE_PRINTF PRINTF=mcu_usb_printf
        endif
else
        DEFINES   += PRINTF\(...\)=
endif

#Feature temporarily disabled
DEFINES   += LEDGER_SPECIFIC

# Compiler, assembler, and linker
ifneq ($(BOLOS_ENV),)
$(info BOLOS_ENV is $(BOLOS_ENV))
CLANGPATH := $(BOLOS_ENV)/clang-arm-fropi/bin/
GCCPATH := $(BOLOS_ENV)/gcc-arm-none-eabi-5_3-2016q1/bin/
else
$(info BOLOS_ENV is not set: falling back to CLANGPATH and GCCPATH)
endif

ifeq ($(CLANGPATH),)
$(info CLANGPATH is not set: clang will be used from PATH)
endif

ifeq ($(GCCPATH),)
$(info GCCPATH is not set: arm-none-eabi-* will be used from PATH)
endif

#########################

CFLAGS  += -Wno-unknown-pragmas -Wno-unused-parameter
CC      := $(CLANGPATH)clang
AS      := $(GCCPATH)arm-none-eabi-gcc
LD      := $(GCCPATH)arm-none-eabi-gcc
LDLIBS  += -lm -lgcc -lc

##########################
include $(BOLOS_SDK)/Makefile.glyphs

ZXLIB_COMPILE_STAX ?= 1

APP_SOURCE_PATH += $(CURDIR)/src
APP_SOURCE_PATH += $(CURDIR)/glyphs
APP_SOURCE_PATH += $(CURDIR)/../deps/sha512
APP_SOURCE_PATH += $(CURDIR)/../deps/jsmn/src

ZXLIB_DIR := $(CURDIR)/../deps/ledger-zxlib/
APP_SOURCE_PATH += $(ZXLIB_DIR)/include
APP_SOURCE_PATH += $(ZXLIB_DIR)/src
APP_SOURCE_PATH += $(ZXLIB_DIR)/app/common
APP_SOURCE_PATH += $(ZXLIB_DIR)/app/ui

SDK_SOURCE_PATH += lib_stusb lib_stusb_impl

ifneq ($(TARGET_NAME),TARGET_STAX)
SDK_SOURCE_PATH += lib_ux
endif

ifeq ($(TARGET_NAME),$(filter $(TARGET_NAME),TARGET_NANOX TARGET_STAX))
SDK_SOURCE_PATH  += lib_blewbxx lib_blewbxx_impl
endif

# Import generic rules from the SDK
include $(BOLOS_SDK)/Makefile.rules

#add dependency on custom makefile filename
dep/%.d: %.c Makefile

.PHONY: rust
rust:
	@echo "No rust code"

.PHONY: rust_clean
rust_clean:
	@echo "No rust code"

# load, delete and listvariants are provided to comply with Ledger requirements
.PHONY: load
load:
	python -m ledgerblue.loadApp $(APP_LOAD_PARAMS)

.PHONY: delete
delete:
	python -m ledgerblue.deleteApp $(COMMON_DELETE_PARAMS)

.PHONY: listvariants
listvariants:
	@echo VARIANTS COIN cro_org
