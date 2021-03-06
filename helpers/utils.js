const yaml = require("js-yaml");
const fs = require("fs");
const { Message } = require("discord.js");

const CUSTOM_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
  new yaml.Type("!FOLDER", {
    kind: "scalar", //η΄ι
    construct: (data) => `${process.cwd()}/${data}`,
  }),
  new yaml.Type("!FOLDER", {
    kind: "sequence", //εΊε
    construct: (data) => data.join("/"),
  }),
  new yaml.Type("!ENV", {
    kind: "scalar",
    construct: (data) => process.env[data],
  }),
]);

/**
 *
 * @param { String } file - file name
 * @param { String } path - path of the file, '/assets/yaml' by default
 * @param { Array } options - load options
 * @returns { String }
 */
const loadYaml = (
  file,
  path = `${process.cwd()}/assets/yaml`,
  options = [],
) => {
  return yaml.load(fs.readFileSync(`${path}/${file}.yaml`, "utf8"), {
    schema: CUSTOM_SCHEMA,
    ...options,
  });
};

/**
 *
 * @param { String } file - file name
 * @param { Object } data - object of data to write
 * @param { String } path - path of the file, '/assets/yaml' by default
 * @param { Array } options - dump options
 * @returns { null }
 */
const writeYaml = (
  file,
  data,
  path = `${process.cwd()}/assets/yaml`,
  options = [],
) => {
  fs.writeFileSync(
    `${path}/${file}.yaml`,
    yaml.dump(data, { schema: CUSTOM_SCHEMA, ...options }),
  );
  return;
};

/**
 *
 * @param { Message } message
 * @returns { import("discord.js").MessageOptions }
 */
const getMessagePayload = (message) => {
  /**
   * @type { import("discord.js").MessageOptions }
   */
  const payload = { content: message.content + "\n", files: [] };
  if (message.attachments) {
    let size = 0;
    message.attachments.forEach((v) => {
      size += v.size;
      payload.files.push(v.attachment);
    });
    if (size >= 7.5 * 1024) {
      payload.files = [];
      message.attachments.forEach(
        (v) => (payload.content += `${v.proxyURL}\n`),
      );
    }
  }
  if (message.embeds.length) payload.embeds = message.embeds;
  return payload;
};

module.exports = { loadYaml, writeYaml, getMessagePayload };
