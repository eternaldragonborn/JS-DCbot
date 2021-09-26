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
 * @param { String } file - file name
 * @param { String } path - path of the file, '/assets/yaml' by default
 * @param { Array } options - load options
 * @returns { String }
 */
const loadYaml = (file, path = `${process.cwd()}/assets/yaml`, options = []) => {
    return yaml.load(fs.readFileSync(`${path}/${file}.yaml`, 'utf8'), { schema: CUSTOM_SCHEMA, ...options });
}

/**
 *
 * @param { String } file - file name
 * @param { Object } data - object of data to write
 * @param { String } path - path of the file, '/assets/yaml' by default
 * @param { Array } options - dump options
 * @returns { null }
 */
const writeYaml = (file, data, path = `${process.cwd()}/assets/yaml`, options = []) => {
    fs.writeFileSync(`${path}/${file}.yaml`, yaml.dump(data, { schema: CUSTOM_SCHEMA, ...options }));
    return;
}

module.exports = { loadYaml, writeYaml }