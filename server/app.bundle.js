/*! For license information please see app.bundle.js.LICENSE.txt */
(()=>{"use strict";var __webpack_modules__={"./server/app.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, "default", { enumerable: true, value: v });\n}) : function(o, v) {\n    o["default"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { "default": mod };\n};\nvar _a;\nObject.defineProperty(exports, "__esModule", ({ value: true }));\n// import { APIError } from \'openai/error\';\nvar path_1 = __importDefault(__webpack_require__(/*! path */ "path"));\n// import OpenAI from \'openai\';\n// import { APIError, OpenAIError } from \'openai/error\';\nvar express_1 = __importDefault(__webpack_require__(/*! express */ "express"));\nvar compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));\nvar serve_favicon_1 = __importDefault(__webpack_require__(/*! serve-favicon */ "serve-favicon"));\nvar body_parser_1 = __importDefault(__webpack_require__(/*! body-parser */ "body-parser"));\nvar mongoose_1 = __importDefault(__webpack_require__(/*! mongoose */ "mongoose"));\nvar express_handlebars_1 = __webpack_require__(/*! express-handlebars */ "express-handlebars");\nvar helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));\nvar express_session_1 = __importDefault(__webpack_require__(/*! express-session */ "express-session"));\nvar redis = __importStar(__webpack_require__(/*! redis */ "redis"));\nvar dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ "dotenv"));\nvar connect_redis_1 = __importDefault(__webpack_require__(/*! connect-redis */ "connect-redis"));\nvar router_1 = __importDefault(__webpack_require__(/*! ./router */ "./server/router.ts"));\nvar io_1 = __importDefault(__webpack_require__(/*! ./io */ "./server/io.ts"));\ndotenv_1.default.config();\n// setup server\nvar port = process.env.PORT || process.env.NODE_PORT || 3000;\nconsole.log((_a = "development") !== null && _a !== void 0 ? _a : \'PROBABLY DEBUG\');\n// setup databases\nvar dbURI = process.env.MONGODB_URI || \'mongodb://127.0.0.1/openbm\';\nmongoose_1.default.connect(dbURI).catch(function (err) {\n    if (err) {\n        console.error(\'\\nCould not connect to database\\n\');\n        throw err;\n    }\n});\nvar redisClient = redis.createClient({\n    url: process.env.REDISCLOUD_URL,\n});\nredisClient.on(\'error\', function (err) { return console.log(\'Redis Client Error\', err); });\n// setup openai\n// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n// const defaultResponses = readJSON(\'../data/default-responses.json\');\n// const disableAI = true;\n// connect to redis, start app\nredisClient.connect().then(function () {\n    var app = (0, express_1.default)();\n    app.use((0, helmet_1.default)());\n    app.use(\'/assets\', express_1.default.static(path_1.default.resolve("".concat(__dirname, "/../hosted"))));\n    app.use((0, serve_favicon_1.default)("".concat(__dirname, "/../hosted/img/favicon.png")));\n    app.use((0, compression_1.default)());\n    app.use(body_parser_1.default.urlencoded({ extended: true }));\n    app.use(body_parser_1.default.json());\n    // use sessions to secure user logins\n    app.use((0, express_session_1.default)({\n        name: \'sessionid\',\n        store: new connect_redis_1.default({\n            client: redisClient,\n        }),\n        secret: \'we need to cook\',\n        resave: false,\n        saveUninitialized: false,\n    }));\n    app.engine(\'handlebars\', (0, express_handlebars_1.engine)({ defaultLayout: \'\' }));\n    app.set(\'view engine\', \'handlebars\');\n    app.set(\'views\', "".concat(__dirname, "/../views"));\n    (0, router_1.default)(app);\n    var server = (0, io_1.default)(app);\n    server.listen(port, function () {\n        console.log("Listening on port ".concat(port));\n    });\n});\n// const main = async () => {\n//     try {\n//         if (disableAI) throw new APIError(400, undefined, \'AI is disabled\', undefined);\n//         const completion = await openai.chat.completions.create({\n//             messages: [{ role: \'system\', content: \'You are a helpful assistant.\' }],\n//             model: \'gpt-3.5-turbo\',\n//         });\n//         console.log(completion.choices[0]);\n//     } catch (err) {\n//         const e = err as APIError;\n//         console.log(e.toString());\n//         console.log(randomString(defaultResponses.errors[e.code || \'default\'].messages));\n//     }\n// };\n// main();\n\n\n//# sourceURL=webpack://open-bm/./server/app.ts?')},"./server/controllers/Account.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError("Generator is already executing.");\n        while (g && (g = 0, op[0] && (_ = 0)), _) try {\n            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { "default": mod };\n};\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nexports.checkUserChatId = exports.getPersonalChatId = exports.logout = exports.loginPage = exports.signup = exports.login = void 0;\nvar mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");\nvar models_1 = __importDefault(__webpack_require__(/*! ../models */ "./server/models/index.ts"));\nvar loginPage = function (req, res) { return res.render(\'login\'); };\nexports.loginPage = loginPage;\nvar logout = function (req, res) {\n    req.session.destroy(function () { });\n    return res.redirect(\'/\');\n};\nexports.logout = logout;\nvar login = function (req, res) {\n    var username = "".concat(req.body.username);\n    var pass = "".concat(req.body.pass);\n    if (!username || !pass) {\n        return res.status(400).json({ error: \'All fields are required\' });\n    }\n    return models_1.default.authenticate(username, pass, function (err, account) {\n        if (err || !account) {\n            return res.status(401).json({ error: \'Wrong username or password!\' });\n        }\n        req.session.account = models_1.default.toAPI(account);\n        return res.json({ redirect: \'/app\' });\n    });\n};\nexports.login = login;\nvar signup = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {\n    var username, pass, pass2, hash, newAccount, err_1;\n    return __generator(this, function (_a) {\n        switch (_a.label) {\n            case 0:\n                username = "".concat(req.body.username);\n                pass = "".concat(req.body.pass);\n                pass2 = "".concat(req.body.pass2);\n                if (!username || !pass || !pass2) {\n                    return [2 /*return*/, res.status(400).json({ error: \'All fields are required!\' })];\n                }\n                if (pass !== pass2) {\n                    return [2 /*return*/, res.status(400).json({ error: \'Passwords must match\' })];\n                }\n                _a.label = 1;\n            case 1:\n                _a.trys.push([1, 4, , 5]);\n                return [4 /*yield*/, models_1.default.generateHash(pass)];\n            case 2:\n                hash = _a.sent();\n                newAccount = new models_1.default({ username: username, password: hash });\n                return [4 /*yield*/, newAccount.save()];\n            case 3:\n                _a.sent();\n                req.session.account = models_1.default.toAPI(newAccount);\n                return [2 /*return*/, res.json({ redirect: \'/app\' })];\n            case 4:\n                err_1 = _a.sent();\n                console.log(err_1);\n                // find out what the error type is\n                if (err_1.code === 11000) {\n                    return [2 /*return*/, res.status(400).json({ error: \'Username is already in use!\' })];\n                }\n                return [2 /*return*/, res.status(500).json({ error: \'An error occured\' })];\n            case 5: return [2 /*return*/];\n        }\n    });\n}); };\nexports.signup = signup;\n/**\n * Retrieve the user\'s chat id. Users can communicate\n * by connecting to each other\'s chat id.\n * @param req\n * @param res\n */\nvar getPersonalChatId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {\n    var query, docs, _a;\n    var _b;\n    return __generator(this, function (_c) {\n        switch (_c.label) {\n            case 0:\n                _c.trys.push([0, 2, , 3]);\n                query = { _id: (_b = req.session.account) === null || _b === void 0 ? void 0 : _b._id };\n                return [4 /*yield*/, models_1.default.findOne(query).exec()];\n            case 1:\n                docs = _c.sent();\n                return [2 /*return*/, res.json({ chatId: docs === null || docs === void 0 ? void 0 : docs._chatId })];\n            case 2:\n                _a = _c.sent();\n                return [2 /*return*/, res.status(500).json({ error: \'Could not retrieve chat id\' })];\n            case 3: return [2 /*return*/];\n        }\n    });\n}); };\nexports.getPersonalChatId = getPersonalChatId;\n/**\n * Check if a user\'s chat id exists\n * @param req\n * @param res\n */\nvar checkUserChatId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {\n    var query, docs, _a;\n    var _b;\n    return __generator(this, function (_c) {\n        switch (_c.label) {\n            case 0:\n                _c.trys.push([0, 2, , 3]);\n                query = { _chatId: new mongoose_1.mongo.ObjectId((_b = req.query.chatId) === null || _b === void 0 ? void 0 : _b.toString()) };\n                return [4 /*yield*/, models_1.default.findOne(query).exec()];\n            case 1:\n                docs = _c.sent();\n                // can find id, tell user it\'s all ok\n                if (docs)\n                    return [2 /*return*/, res.status(200).json({ message: true })];\n                // cannot find id, probably the user\'s fault\n                return [2 /*return*/, res.status(400).json({ message: false })];\n            case 2:\n                _a = _c.sent();\n                return [2 /*return*/, res.status(500).json({ message: false })];\n            case 3: return [2 /*return*/];\n        }\n    });\n}); };\nexports.checkUserChatId = checkUserChatId;\n\n\n//# sourceURL=webpack://open-bm/./server/controllers/Account.ts?')},"./server/controllers/App.ts":(__unused_webpack_module,exports)=>{eval('\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nvar main = function (req, res) { return res.render(\'app\'); };\nexports["default"] = main;\n\n\n//# sourceURL=webpack://open-bm/./server/controllers/App.ts?')},"./server/controllers/index.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, "default", { enumerable: true, value: v });\n}) : function(o, v) {\n    o["default"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nexports.page500 = exports.page404 = exports.App = exports.Account = void 0;\nvar page404 = function (req, res) {\n    var title = \'404 Page Not Found\';\n    var message = \'\';\n    return res.render(\'error\', { title: title, message: message });\n};\nexports.page404 = page404;\nvar page500 = function (req, res) {\n    var title = \'500 Internal Server Error\';\n    var message = \'\';\n    return res.render(\'error\', { title: title, message: message });\n};\nexports.page500 = page500;\nexports.Account = __importStar(__webpack_require__(/*! ./Account */ "./server/controllers/Account.ts"));\nexports.App = __importStar(__webpack_require__(/*! ./App */ "./server/controllers/App.ts"));\n\n\n//# sourceURL=webpack://open-bm/./server/controllers/index.ts?')},"./server/io.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { "default": mod };\n};\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nvar http_1 = __importDefault(__webpack_require__(/*! http */ "http"));\nvar socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");\nvar io;\nvar handleMessage = function (socket, msg) {\n    socket.rooms.forEach(function (room) {\n        // don\'t send a message to itself\n        if (room === socket.id)\n            return;\n        io.to(room).emit(\'chat message\', msg);\n    });\n};\nvar handleRoomChange = function (socket, roomId) {\n    socket.rooms.forEach(function (room) {\n        if (room === socket.id)\n            return;\n        socket.leave(room);\n    });\n    socket.join(roomId);\n    console.log(roomId);\n};\nvar setupServer = function (app) {\n    var server = http_1.default.createServer(app);\n    io = new socket_io_1.Server(server);\n    io.on(\'connection\', function (socket) {\n        socket.on(\'chat message\', function (msg) { return handleMessage(socket, msg); });\n        socket.on(\'room change\', function (room) { return handleRoomChange(socket, room); });\n    });\n    return server;\n};\nexports["default"] = setupServer;\n\n\n//# sourceURL=webpack://open-bm/./server/io.ts?')},"./server/middleware/index.ts":(__unused_webpack_module,exports)=>{eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.requiresLogout = exports.requiresLogin = exports.requiresSecure = void 0;\nvar requiresLogin = function (req, res, next) {\n    if (!req.session.account) {\n        return res.redirect('/');\n    }\n    return next();\n};\nexports.requiresLogin = requiresLogin;\nvar requiresLogout = function (req, res, next) {\n    if (req.session.account) {\n        return res.redirect('/app');\n    }\n    return next();\n};\nexports.requiresLogout = requiresLogout;\nvar requiresSecure = function (req, res, next) {\n    if (req.headers['x-forwarded-proto'] !== 'https') {\n        return res.redirect(\"https://\".concat(req.hostname).concat(req.url));\n    }\n    return next();\n};\nvar bypassSecure = function (req, res, next) {\n    next();\n};\nvar optionalSecure =  false\n    ? 0 : bypassSecure;\nexports.requiresSecure = optionalSecure;\n\n\n//# sourceURL=webpack://open-bm/./server/middleware/index.ts?")},"./server/models/Account.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError("Generator is already executing.");\n        while (g && (g = 0, op[0] && (_ = 0)), _) try {\n            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { "default": mod };\n};\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nexports.AccountModel = void 0;\nvar bcrypt_1 = __importDefault(__webpack_require__(/*! bcrypt */ "bcrypt"));\nvar mongoose_1 = __importDefault(__webpack_require__(/*! mongoose */ "mongoose"));\nvar mongodb_1 = __webpack_require__(/*! mongodb */ "mongodb");\nvar saltRounds = 10;\nvar AccountSchema = new mongoose_1.default.Schema({\n    username: {\n        type: String,\n        required: true,\n        trim: true,\n        unique: true,\n        match: /^[A-Za-z0-9_\\-.]{1,16}$/,\n    },\n    password: {\n        type: String,\n        required: true,\n    },\n    createdDate: {\n        type: Date,\n        default: Date.now,\n    },\n    _chatId: {\n        type: mongoose_1.default.Types.ObjectId,\n        default: new mongodb_1.ObjectId(mongodb_1.ObjectId.generate(Date.now())),\n    },\n});\nvar model;\n// Converts an account doc to something we can store in redis later on.\nAccountSchema.static(\'toAPI\', function (doc) { return ({\n    username: doc.username,\n    _id: doc._id,\n}); });\n// Helper function to hash a password\nAccountSchema.static(\'generateHash\', function (password) { return bcrypt_1.default.hash(password, saltRounds); });\n/**\n * Match a given username and password against an existing one in the database\n * @param username\n * @param password\n * @param callback\n */\nAccountSchema.static(\'authenticate\', function (username, password, callback) { return __awaiter(void 0, void 0, void 0, function () {\n    var doc, match, err_1;\n    return __generator(this, function (_a) {\n        switch (_a.label) {\n            case 0:\n                _a.trys.push([0, 3, , 4]);\n                return [4 /*yield*/, model.findOne({ username: username }).exec()];\n            case 1:\n                doc = _a.sent();\n                if (!doc) {\n                    return [2 /*return*/, callback()];\n                }\n                return [4 /*yield*/, bcrypt_1.default.compare(password, doc.password)];\n            case 2:\n                match = _a.sent();\n                if (match) {\n                    return [2 /*return*/, callback(null, doc)];\n                }\n                return [2 /*return*/, callback()];\n            case 3:\n                err_1 = _a.sent();\n                return [2 /*return*/, callback(err_1)];\n            case 4: return [2 /*return*/];\n        }\n    });\n}); });\nmodel = mongoose_1.default.model(\'Account\', AccountSchema);\nvar AccountModel = model;\nexports.AccountModel = AccountModel;\nexports["default"] = AccountModel;\n\n\n//# sourceURL=webpack://open-bm/./server/models/Account.ts?')},"./server/models/index.ts":function(__unused_webpack_module,exports,__webpack_require__){eval('\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { "default": mod };\n};\nObject.defineProperty(exports, "__esModule", ({ value: true }));\nvar Account_1 = __importDefault(__webpack_require__(/*! ./Account */ "./server/models/Account.ts"));\nexports["default"] = Account_1.default;\n\n\n//# sourceURL=webpack://open-bm/./server/models/index.ts?')},"./server/router.ts":function(__unused_webpack_module,exports,__webpack_require__){eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar mid = __importStar(__webpack_require__(/*! ./middleware */ \"./server/middleware/index.ts\"));\nvar controllers_1 = __webpack_require__(/*! ./controllers */ \"./server/controllers/index.ts\");\nvar router = function (app) {\n    app.get('/', mid.requiresLogout, controllers_1.Account.loginPage);\n    // login requests\n    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers_1.Account.loginPage);\n    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers_1.Account.login);\n    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers_1.Account.signup);\n    app.get('/logout', mid.requiresLogin, controllers_1.Account.logout);\n    // main app\n    app.get('/app', mid.requiresSecure, mid.requiresLogin, controllers_1.App.default);\n    app.get('/personalChatId', mid.requiresSecure, controllers_1.Account.getPersonalChatId);\n    app.get('/checkUserChatId', mid.requiresSecure, controllers_1.Account.checkUserChatId);\n    app.get('/404', controllers_1.page404);\n    app.get('/500', controllers_1.page500);\n    // setup 404 page\n    app.use(function (req, res) {\n        if (req.accepts('html')) {\n            (0, controllers_1.page404)(req, res);\n        }\n    });\n};\nexports[\"default\"] = router;\n\n\n//# sourceURL=webpack://open-bm/./server/router.ts?")},bcrypt:e=>{e.exports=require("bcrypt")},"body-parser":e=>{e.exports=require("body-parser")},compression:e=>{e.exports=require("compression")},"connect-redis":e=>{e.exports=require("connect-redis")},dotenv:e=>{e.exports=require("dotenv")},express:e=>{e.exports=require("express")},"express-handlebars":e=>{e.exports=require("express-handlebars")},"express-session":e=>{e.exports=require("express-session")},helmet:e=>{e.exports=require("helmet")},mongodb:e=>{e.exports=require("mongodb")},mongoose:e=>{e.exports=require("mongoose")},redis:e=>{e.exports=require("redis")},"serve-favicon":e=>{e.exports=require("serve-favicon")},"socket.io":e=>{e.exports=require("socket.io")},http:e=>{e.exports=require("http")},path:e=>{e.exports=require("path")}},__webpack_module_cache__={};function __webpack_require__(e){var n=__webpack_module_cache__[e];if(void 0!==n)return n.exports;var r=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e].call(r.exports,r,r.exports,__webpack_require__),r.exports}var __webpack_exports__=__webpack_require__("./server/app.ts")})();