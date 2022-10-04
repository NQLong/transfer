module.exports = app => {

    // Upload Hook ----------------------------------------------------------------------------------------------------------------------------------
    const uploadHooksList = {}, uploadHooksNoUserList = {};
    app.uploadHooks = {
        add: (name, hook, isUser = true) => isUser ? (uploadHooksList[name] = hook) : (uploadHooksNoUserList[name] = hook),
        remove: name => uploadHooksList[name] = null,

        run: (req, fields, files, params, sendResponse) => {
            const list = req.session.user ? uploadHooksList : uploadHooksNoUserList,
                hookNames = Object.keys(list);
            console.log({ user: req.session });
            hookNames.forEach(hookName => list[hookName] && list[hookName](req, fields, files, params, data => {
                data && sendResponse(data);
            }));
        },
    };

    // Ready Hook ----------------------------------------------------------------------------------------------------------------------------------
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
                    console.log(hookKeys[i]);
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