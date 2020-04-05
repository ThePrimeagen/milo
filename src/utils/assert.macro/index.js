const { createMacro, MacroError } = require('babel-plugin-macros');

module.exports = createMacro(assertMacro, MacroError);

function assertMacro({ references, state, babel }) {
    const { template } = babel;
    const { default: defaultImport = [], ...otherReferences } = references;
    
    const enabled = process.env.NODE_ENV === 'development';
    const implTarget = process.env.TARGET_PLATFORM;

    const invalidImports = Object.keys(otherReferences);
    if (invalidImports.length > 0) {
        throw new MacroError(`You should only import assert as default. You are also importing ${invalidImports.join(', ')}.`);
    }

    if (defaultImport.length < 1) {
        return;
    }
    
    let assertTemplate;
    if (implTarget === 'nrdp') {
        assertTemplate = template(`const assert = nrdp.assert;`);
    }
    if (implTarget === 'node') {
        assertTemplate = template(`const assert = require('assert');`);
    }

    if (!assertTemplate) {
        throw new MacroError(`assert template not found for target: ${implTarget}`);
    }

    if (enabled) {
        
        state.file.ast.program.body.unshift(assertTemplate());
    }

    defaultImport.forEach((referencePath) => {
        if (!enabled) {
            referencePath.parentPath.remove();
            return;
        }

        if (referencePath.parentPath.type !== 'CallExpression') {
            throw new MacroError('you must call the macro');
        }

        const args = referencePath.parentPath.get('arguments');
        if (args.length < 1) {
            throw new MacroError(`assert() needs at least 1 argument (the assertion condition).`);
        }
    });
}