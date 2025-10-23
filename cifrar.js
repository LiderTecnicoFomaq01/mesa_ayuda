// hash_bcrypt.js (ESM). Si usas require, dime y te lo adapto.
import bcrypt from "bcrypt";
import readline from "readline";

const SALT_ROUNDS = 12;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Ingresa el número (o texto) a cifrar: ", async (input) => {
    try {
        const password = String(input); // asegúrate de tratarlo como string
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        console.log("\nHash bcrypt:\n", hash);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        rl.close();
    }
});
