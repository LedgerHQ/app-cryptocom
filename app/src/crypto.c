/*******************************************************************************
*   (c) 2019 Zondax GmbH
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
********************************************************************************/

#include "crypto.h"
#include "coin.h"
#include "zxmacros.h"
#include "apdu_codes.h"

#include <bech32.h>

uint32_t hdPath[HDPATH_LEN_DEFAULT];

uint8_t bech32_hrp_len;
char bech32_hrp[MAX_BECH32_HRP_LEN + 1];

#include "crypto_helpers.h"
#include "cx.h"

void crypto_extractPublicKey(const uint32_t path[HDPATH_LEN_DEFAULT], uint8_t *pubKey, uint16_t pubKeyLen) {
    uint8_t raw_pubkey[65];
    if (pubKeyLen < PK_LEN_SECP256K1) {
        return;
    }

    CX_ASSERT(bip32_derive_get_pubkey_256(CX_CURVE_256K1, path, HDPATH_LEN_DEFAULT, raw_pubkey, NULL, CX_SHA256));

    // Format pubkey
    for (int i = 0; i < 32; i++) {
        pubKey[i] = raw_pubkey[64 - i];
    }
    raw_pubkey[0] = raw_pubkey[64] & 1 ? 0x03 : 0x02; // "Compress" public key in place
    if ((raw_pubkey[32] & 1) != 0) {
        pubKey[31] |= 0x80;
    }
    //////////////////////
    MEMCPY(pubKey, raw_pubkey, PK_LEN_SECP256K1);
}

uint16_t crypto_sign(uint8_t *signature,
                     uint16_t signatureMaxlen,
                     const uint8_t *message,
                     uint16_t messageLen) {
    uint8_t messageDigest[CX_SHA256_SIZE];

    // Hash it
    cx_hash_sha256(message, messageLen, messageDigest, CX_SHA256_SIZE);

    size_t signatureLength = (size_t) signatureMaxlen;
    uint32_t info = 0;

    CX_ASSERT(bip32_derive_ecdsa_sign_hash_256(CX_CURVE_256K1,
                                               hdPath,
                                               HDPATH_LEN_DEFAULT,
                                               CX_RND_RFC6979 | CX_LAST,
                                               CX_SHA256,
                                               messageDigest,
                                               CX_SHA256_SIZE,
                                               signature,
                                               &signatureLength,
                                               &info));

    return (uint16_t) signatureLength;
}

uint8_t extractHRP(uint32_t rx, uint32_t offset) {
    if (rx < offset + 1) {
        THROW(APDU_CODE_DATA_INVALID);
    }
    MEMZERO(bech32_hrp, MAX_BECH32_HRP_LEN);

    bech32_hrp_len = G_io_apdu_buffer[offset];

    if (bech32_hrp_len == 0 || bech32_hrp_len > MAX_BECH32_HRP_LEN) {
        THROW(APDU_CODE_DATA_INVALID);
    }

    memcpy(bech32_hrp, G_io_apdu_buffer + offset + 1, bech32_hrp_len);
    bech32_hrp[bech32_hrp_len] = 0;     // zero terminate

    return bech32_hrp_len;
}

void ripemd160_32(uint8_t *out, uint8_t *in) {
    cx_ripemd160_t rip160;
    cx_ripemd160_init(&rip160);
    CX_ASSERT(cx_hash_no_throw(&rip160.header, CX_LAST, in, CX_SHA256_SIZE, out, CX_RIPEMD160_SIZE));
}

void crypto_set_hrp(char *p) {
    bech32_hrp_len = strlen(p);
    if (bech32_hrp_len < MAX_BECH32_HRP_LEN) {
        strlcpy(bech32_hrp, p, MAX_BECH32_HRP_LEN + 1);
    }
}

uint16_t crypto_fillAddress(uint8_t *buffer, uint16_t buffer_len) {
    if (buffer_len < PK_LEN_SECP256K1 + 50) {
        return 0;
    }

    // extract pubkey
    crypto_extractPublicKey(hdPath, buffer, buffer_len);

    // Hash it
    uint8_t hashed1_pk[CX_SHA256_SIZE];
    cx_hash_sha256(buffer, PK_LEN_SECP256K1, hashed1_pk, CX_SHA256_SIZE);

    uint8_t hashed2_pk[CX_RIPEMD160_SIZE];
    ripemd160_32(hashed2_pk, hashed1_pk);

    char *addr = (char *) (buffer + PK_LEN_SECP256K1);
    bech32EncodeFromBytes(addr, buffer_len - PK_LEN_SECP256K1, bech32_hrp, hashed2_pk, CX_RIPEMD160_SIZE, 0, BECH32_ENCODING_BECH32);

    return PK_LEN_SECP256K1 + strlen(addr);
}
