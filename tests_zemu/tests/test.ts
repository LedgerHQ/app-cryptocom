import { jest, describe, expect, it, test } from "@jest/globals";
import Zemu from "@zondax/zemu";
import { DEFAULT_START_OPTIONS, TouchNavigation, ButtonKind } from "@zondax/zemu";
import crypto from "crypto";
import CosmosApp from "ledger-cosmos-js";
import secp256k1 from "secp256k1/elliptic";
const Resolve = require("path").resolve;
import {
    APP_SEED,
    models,
    example_tx_str_basic,
    example_tx_str_combined,
    example_tx_str_expert,
} from "./common";

let defaultOptions = {
    ...DEFAULT_START_OPTIONS,
    logging: true,
    custom: `-s "${APP_SEED}"`,
    X11: false,
};

jest.setTimeout(30000);

describe("Basic checks", function () {
    test.concurrent.each(models)("can start and stop container ($name)", async function ({ name, path }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("get app version ($name)", async function ({ name, path }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
            const app = new CosmosApp(sim.getTransport());
            const resp = await app.getVersion();

            console.log(resp);

            expect(resp.return_code).toEqual(0x9000);
            expect(resp.error_message).toEqual("No errors");
            expect(resp).toHaveProperty("test_mode");
            expect(resp).toHaveProperty("major");
            expect(resp).toHaveProperty("minor");
            expect(resp).toHaveProperty("patch");
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("get app info ($name)", async function ({ name, path }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
            const app = new CosmosApp(sim.getTransport());
            const info = await app.appInfo();

            console.log(info);
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("get address ($name)", async function ({ name, path }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
            const app = new CosmosApp(sim.getTransport());
            // Derivation path. First 3 items are automatically hardened!
            const path = [44, 394, 5, 0, 3];
            const resp = await app.getAddressAndPubKey(path, "cro");

            console.log(resp);

            expect(resp.return_code).toEqual(0x9000);
            expect(resp.error_message).toEqual("No errors");

            expect(resp).toHaveProperty("bech32_address");
            expect(resp).toHaveProperty("compressed_pk");

            expect(resp.bech32_address).toEqual("cro12w3875w2a3qqqpheslfznf4e270jm005j098sg");
            expect(resp.compressed_pk.length).toEqual(33);
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("show address ($name)", async function ({ name, path, prefix }) {
        const sim = new Zemu(path);
        try {
            await sim.start({
                ...defaultOptions,
                model: name,
                approveAction: ButtonKind.ApproveTapButton,
                approveKeyword: name === "stax" ? "Cancel" : "APPROVE",
            });
            const app = new CosmosApp(sim.getTransport());

            const path = [44, 394, 5, 0, 3];
            const respRequest = app.showAddressAndPubKey(path, "cro");

            // Wait until we are not in the main menu
            await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
            await sim.compareSnapshotsAndApprove(".", `${prefix.toLowerCase()}-show_address`);

            const resp = await respRequest;
            console.log(resp);

            expect(resp.return_code).toEqual(0x9000);
            expect(resp.error_message).toEqual("No errors");
            expect(resp).toHaveProperty("bech32_address");
            expect(resp).toHaveProperty("compressed_pk");
            expect(resp.bech32_address).toEqual("cro12w3875w2a3qqqpheslfznf4e270jm005j098sg");
            expect(resp.compressed_pk.length).toEqual(33);
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("show address - reject ($name)", async function ({ name, path, prefix }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
            const app = new CosmosApp(sim.getTransport());

            const path = [44, 394, 5, 0, 3];
            const respRequest = app.showAddressAndPubKey(path, "cro");

            // Wait until we are not in the main menu
            await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
            await sim.compareSnapshotsAndReject(".", `${prefix.toLowerCase()}-show_address_reject`);

            const resp = await respRequest;
            console.log(resp);

            expect(resp.return_code).toEqual(0x6986);
            expect(resp.error_message).toEqual("Transaction rejected");
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)("show address - HUGE ($name)", async function ({ name, path }) {
        const sim = new Zemu(path);
        try {
            await sim.start({ ...defaultOptions, model: name });
            const app = new CosmosApp(sim.getTransport());

            // Derivation path. First 3 items are automatically hardened!
            const path = [44, 394, 2147483647, 0, 4294967295];
            const resp = await app.showAddressAndPubKey(path, "cro");
            console.log(resp);

            expect(resp.return_code).toEqual(0x6985);
            expect(resp.error_message).toEqual("Conditions not satisfied");
        } finally {
            await sim.close();
        }
    });

    test.concurrent.each(models)(
        "show address - HUGE - expert ($name)",
        async function ({ name, path, prefix }) {
            const sim = new Zemu(path);
            try {
                await sim.start({
                    ...defaultOptions,
                    model: name,
                    approveAction: ButtonKind.ApproveTapButton,
                    approveKeyword: name === "stax" ? "Path" : "APPROVE",
                });

                const app = new CosmosApp(sim.getTransport());

                // Activate expert mode
                const snap_num = await sim.toggleExpertMode(
                    `${prefix.toLowerCase()}-show_address_huge_expert`,
                    true,
                    0
                );
                expect(
                    sim.compareSnapshots(".", `${prefix.toLowerCase()}-show_address_huge_expert`, snap_num)
                ).toEqual(true);

                // Derivation path. First 3 items are automatically hardened!
                const path = [44, 394, 2147483647, 0, 4294967295];
                const respRequest = app.showAddressAndPubKey(path, "cro");

                // Wait until we are not in the main menu
                await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());

                // Now navigate the address / path
                await sim.compareSnapshotsAndApprove(
                    ".",
                    `${prefix.toLowerCase()}-show_address_huge_expert`,
                    undefined,
                    snap_num + 1
                );

                const resp = await respRequest;
                console.log(resp);

                expect(resp.return_code).toEqual(0x9000);
                expect(resp.error_message).toEqual("No errors");
                expect(resp).toHaveProperty("bech32_address");
                expect(resp).toHaveProperty("compressed_pk");
                expect(resp.bech32_address).toEqual("cro1gp7crpcy9quz7wackt56htrgy67yj09wlxut2r");
                expect(resp.compressed_pk.length).toEqual(33);
            } finally {
                await sim.close();
            }
        }
    );

    async function navigate_and_sign(tx_json, name, path, prefix, snap_suffix) {
        const sim = new Zemu(path);
        try {
            await sim.start({
                ...defaultOptions,
                model: name,
                approveAction: ButtonKind.ApproveHoldButton,
                approveKeyword: name === "stax" ? "approve" : "APPROVE",
            });
            const app = new CosmosApp(sim.getTransport());

            const path = [44, 394, 0, 0, 0];
            let tx = JSON.stringify(tx_json);

            // get address / publickey
            const respPk = await app.getAddressAndPubKey(path, "cro");
            expect(respPk.return_code).toEqual(0x9000);
            expect(respPk.error_message).toEqual("No errors");
            console.log(respPk);

            // do not wait here..
            const signatureRequest = app.sign(path, tx);

            // Wait until we are not in the main menu
            await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());

            // Now navigate and approve tx
            await sim.compareSnapshotsAndApprove(".", `${prefix.toLowerCase()}-${snap_suffix}`);

            let resp = await signatureRequest;
            console.log(resp);

            expect(resp.return_code).toEqual(0x9000);
            expect(resp.error_message).toEqual("No errors");

            // Now verify the signature
            const hash = crypto.createHash("sha256");
            const msgHash = Uint8Array.from(hash.update(tx).digest());

            const signatureDER = resp.signature;
            const signature = secp256k1.signatureImport(Uint8Array.from(signatureDER));

            const pk = Uint8Array.from(respPk.compressed_pk);

            const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, pk);
            expect(signatureOk).toEqual(true);
        } finally {
            await sim.close();
        }
    }

    test.concurrent.each(models)("sign basic tx ($name)", async function ({ name, path, prefix }) {
        await navigate_and_sign(example_tx_str_basic, name, path, prefix, "sign_basic");
    });

    test.concurrent.each(models)("sign basic tx - combined ($name)", async function ({ name, path, prefix }) {
        await navigate_and_sign(example_tx_str_combined, name, path, prefix, "sign_basic_combined");
    });

    test.concurrent.each(models)("sign expert ($name)", async function ({ name, path, prefix }) {
        await navigate_and_sign(example_tx_str_expert, name, path, prefix, "sign_expert");
    });

    test.concurrent.each(models)(
        "show address and sign basic ($name)",
        async function ({ name, path, prefix }) {
            const sim = new Zemu(path);
            try {
                await sim.start({
                    ...defaultOptions,
                    model: name,
                    approveAction: ButtonKind.ApproveTapButton,
                    approveKeyword: name === "stax" ? "Cancel" : "APPROVE",
                });
                const app = new CosmosApp(sim.getTransport());

                const path = [44, 394, 0, 0, 0];
                let tx = JSON.stringify(example_tx_str_basic);

                // get address / publickey
                const respRequest = app.showAddressAndPubKey(path, "cro");

                // Wait until we are not in the main menu
                await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());

                // Now navigate the address / path
                await sim.compareSnapshotsAndApprove(".", `${prefix.toLowerCase()}-show_address_sign_basic`);

                const respPk = await respRequest;
                console.log(respPk);

                expect(respPk.return_code).toEqual(0x9000);
                expect(respPk.error_message).toEqual("No errors");
                console.log(respPk);

                // do not wait here..
                const signatureRequest = app.sign(path, tx);

                // Now navigate and approve tx
                let startImgIdx = 0;
                if (name === "stax") {
                    startImgIdx = 3;
                } else if (name === "nanos") {
                    startImgIdx = 5;
                } else {
                    startImgIdx = 4;
                }
                // Wait until we are not in the main menu
                await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
                sim.deleteEvents();
                const any_sim = sim as any;
                any_sim.startOptions.approveAction = ButtonKind.ApproveHoldButton;
                (any_sim.startOptions.approveKeyword = name === "stax" ? "approve" : "APPROVE"),
                    await sim.compareSnapshotsAndApprove(
                        ".",
                        `${prefix.toLowerCase()}-show_address_sign_basic`,
                        undefined,
                        startImgIdx
                    );

                let resp = await signatureRequest;
                console.log(resp);

                expect(resp.return_code).toEqual(0x9000);
                expect(resp.error_message).toEqual("No errors");

                // Now verify the signature
                const hash = crypto.createHash("sha256");
                const msgHash = Uint8Array.from(hash.update(tx).digest());

                const signatureDER = resp.signature;
                const signature = secp256k1.signatureImport(Uint8Array.from(signatureDER));

                const pk = Uint8Array.from(respPk.compressed_pk);

                const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, pk);
                expect(signatureOk).toEqual(true);
            } finally {
                await sim.close();
            }
        }
    );
});
