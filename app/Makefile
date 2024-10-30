#*******************************************************************************
#   Ledger App
#   (c) 2024 Ledger
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
$(error Environment variable BOLOS_SDK is not set)
endif

include $(BOLOS_SDK)/Makefile.defines

########################################
#        Mandatory configuration       #
########################################
# Application name
APPNAME = "Cronos POS Chain"

# Application version
APPVERSION_M=2
APPVERSION_N=18
APPVERSION_P=0
APPVERSION = "$(APPVERSION_M).$(APPVERSION_N).$(APPVERSION_P)"

# Application source files
APP_SOURCE_PATH += src
APP_SOURCE_PATH += $(CURDIR)/../deps/jsmn/src
ZXLIB_DIR := $(CURDIR)/../deps/ledger-zxlib/
APP_SOURCE_PATH += $(ZXLIB_DIR)/include
APP_SOURCE_PATH += $(ZXLIB_DIR)/src
APP_SOURCE_PATH += $(ZXLIB_DIR)/app/common
APP_SOURCE_PATH += $(ZXLIB_DIR)/app/ui

# Application icons following guidelines:
# https://developers.ledger.com/docs/embedded-app/design-requirements/#device-icon
ICON_NANOS = icons/nanos_icon.gif
ICON_NANOX = icons/nanox_icon.gif
ICON_NANOSP = icons/nanox_icon.gif
ICON_STAX = icons/stax_icon.gif
ICON_FLEX = icons/flex_icon.gif

# Application allowed derivation curves.
CURVE_APP_LOAD_PARAMS = secp256k1

# Application allowed derivation paths.
PATH_APP_LOAD_PARAMS = "44'/394'"   # purpose=coin(44) / coin_type=Crypto Chain(394)

# Setting to allow building variant applications
VARIANT_PARAM=COIN
VARIANT_VALUES=cro_org

# Set the default value for PRODUCTION_BUILD to 1 if not already defined
PRODUCTION_BUILD ?= 1
DEFINES += PRODUCTION_BUILD=${PRODUCTION_BUILD}

# Enabling DEBUG flag will enable PRINTF and disable optimizations
#DEBUG = 1

########################################
#     Application custom permissions   #
########################################
# See SDK `include/appflags.h` for the purpose of each permission
ifeq ($(TARGET_NAME),$(filter $(TARGET_NAME),TARGET_NANOX TARGET_STAX TARGET_FLEX))
HAVE_APPLICATION_FLAG_BOLOS_SETTINGS = 1
endif

########################################
# Application communication interfaces #
########################################
ENABLE_BLUETOOTH = 1

########################################
#         NBGL custom features         #
########################################
ENABLE_NBGL_QRCODE = 1

########################################
#          Features disablers          #
########################################
# Use only specific files from standard app
DISABLE_STANDARD_APP_FILES = 1
APP_SOURCE_FILES += ${BOLOS_SDK}/lib_standard_app/crypto_helpers.c
INCLUDES_PATH += ${BOLOS_SDK}/lib_standard_app

ifeq ($(TARGET_NAME), TARGET_NANOS)
DISABLE_STANDARD_BAGL_UX_FLOW = 1
endif

########################################
#          Zondax specific config      #
########################################
DEFINES       += REVIEW_SCREEN_ENABLED # zxlib : enable nanos "please review" screen. 
DEFINES       += HAVE_BOLOS_APP_STACK_CANARY
DEFINES       += LEDGER_SPECIFIC

include $(BOLOS_SDK)/Makefile.standard_app
