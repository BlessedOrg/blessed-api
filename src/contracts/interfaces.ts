import path from "path";
import fs from "fs";

export function importAllJsonContractsArtifacts() {
  const dirPath = path.join(process.cwd(), "src/contracts/artifacts");
  const files = fs.readdirSync(dirPath);
  const jsonObjects: { [key: string]: any } = {};

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(file, ".json");
      jsonObjects[fileName] = JSON.parse(fileContent);
    }
  });
  return jsonObjects;
}
