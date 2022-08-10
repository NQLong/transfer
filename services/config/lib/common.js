module.exports = app => {
    app.clone = function () {
        const length = arguments.length;
        let result = null;
        if (length && Array.isArray(arguments[0])) {
            result = [];
            for (let i = 0; i < length; i++) {
                result = result.concat(arguments[i]);
            }
        } else if (length && typeof arguments[0] == 'object') {
            result = {};
            for (let i = 0; i < length; i++) {
                const obj = JSON.parse(JSON.stringify(arguments[i]));
                Object.keys(obj).forEach(key => result[key] = obj[key]);
            }
        }
        return result;
    };

    // Ready Hook -----------------------------------------------------------------------------------------------------
    const readyHookContainer = {};
    let readyHooksId = null;
    app.readyHooks = {
        add: (name, hook) => {
            readyHookContainer[name] = hook;
            app.readyHooks.waiting();
        },
        remove: name => {
            readyHookContainer[name] = null;
            app.readyHooks.waiting();
        },

        waiting: () => {
            if (readyHooksId) clearTimeout(readyHooksId);
            readyHooksId = setTimeout(app.readyHooks.run, 2000);
        },

        run: () => {
            let hookKeys = Object.keys(readyHookContainer),
                ready = true;

            // Check all hooks
            for (let i = 0; i < hookKeys.length; i++) {
                const hook = readyHookContainer[hookKeys[i]];
                if (!hook.ready()) {
                    ready = false;
                    break;
                }
            }

            if (ready) {
                hookKeys.forEach(hookKey => readyHookContainer[hookKey].run());
                console.log(` - #${process.pid}${app.primaryWorker ? ' (primary)' : ''}: The system is ready!`);
            } else {
                app.readyHooks.waiting();
            }
        }
    };
    app.readyHooks.waiting();
};