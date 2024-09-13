var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SrtParser_input, _SrtParser_caption;
export class SrtParser {
    constructor(input) {
        _SrtParser_input.set(this, void 0);
        _SrtParser_caption.set(this, new Map());
        __classPrivateFieldSet(this, _SrtParser_input, input, "f");
    }
    lexer() {
        const input = __classPrivateFieldGet(this, _SrtParser_input, "f");
    }
    GetKey(key) {
        return __classPrivateFieldGet(this, _SrtParser_caption, "f").get(String(key));
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = __classPrivateFieldGet(this, _SrtParser_input, "f");
            const regex = /(\r\n|\r|\n)/g;
            const sliced_input = input.split(regex).filter(slice => { return !slice.match(/(\r\n|\r|\n)/g) && slice != ""; });
            let number = -1;
            let i = 0;
            let _caption;
            const array_regex = [/^\d+$/, /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/];
            while (i < sliced_input.length) {
                if (array_regex[0].test(sliced_input[i])) {
                    if (number !== -1 || i == sliced_input.length - 1) {
                        __classPrivateFieldGet(this, _SrtParser_caption, "f").set(String(number), _caption);
                    }
                    number = Number(sliced_input[i]);
                    _caption = {
                        init: '',
                        end: '',
                        captions: []
                    };
                }
                else if (array_regex[1].test(sliced_input[i])) {
                    const match = sliced_input[i].match(array_regex[1]);
                    _caption.init = match[1];
                    _caption.end = match[2];
                }
                else {
                    _caption.captions.push(sliced_input[i]);
                }
                i += 1;
                if (number !== -1) {
                    __classPrivateFieldGet(this, _SrtParser_caption, "f").set(String(number), _caption);
                }
            }
        });
    }
}
_SrtParser_input = new WeakMap(), _SrtParser_caption = new WeakMap();
