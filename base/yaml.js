const yaml = require('js-yaml');
const fs = require('fs');

const CUSTOM_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
    new yaml.Type('!FOLDER', {
        kind: 'scalar',  //純量
        construct: data => `${process.cwd()}/${data}`
    }),
    new yaml.Type('!FOLDER', {
        kind: 'sequence', //序列
        construct: data => data.join('/')
    })
])

/**
 *
 * @param { String } file - path of the file
 * @param { Array } options - load options
 * @returns { String }
 */
const loadYaml = (file, options = []) => {
    return yaml.load(fs.readFileSync(file, 'utf8'), { schema: CUSTOM_SCHEMA, ...options });
}

/**
 *
 * @param { String } file - path of the file
 * @param { Object } data - object of data to write
 * @param { Array } options - dump options
 * @returns { null }
 */
const writeYaml = (file, data, options = []) => {
    fs.writeFileSync(file, yaml.dump(data, { schema: CUSTOM_SCHEMA, ...options }));
    return;
}

module.exports = { loadYaml, writeYaml }