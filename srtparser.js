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
var _SrtParser_instances, _SrtParser_input, _SrtParser_current, _SrtParser_caption, _SrtParser_tracks, _SrtParser__stdout, _SrtParser_media, _SrtParser_track_lists, _SrtParser_Process;
export class SrtParser {
    constructor() {
        _SrtParser_instances.add(this);
        _SrtParser_input.set(this, void 0);
        _SrtParser_current.set(this, void 0);
        _SrtParser_caption.set(this, new Map());
        _SrtParser_tracks.set(this, new Map());
        _SrtParser__stdout.set(this, void 0);
        _SrtParser_media.set(this, void 0);
        _SrtParser_track_lists.set(this, []);
    }
    set stdout(elem) {
        __classPrivateFieldSet(this, _SrtParser__stdout, elem, "f");
    }
    SetCaptions(TrackObject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                TrackObject.forEach((Track) => __awaiter(this, void 0, void 0, function* () {
                    console.log(Track.url);
                    const res = yield this.request(Track.url);
                    __classPrivateFieldSet(this, _SrtParser_input, res, "f");
                    let data = __classPrivateFieldGet(this, _SrtParser_instances, "m", _SrtParser_Process).call(this);
                    const media = __classPrivateFieldGet(this, _SrtParser_media, "f");
                    const TEXT_T = media.addTextTrack("captions", Track.label, Track.language);
                    const length = __classPrivateFieldGet(this, _SrtParser_tracks, "f").size;
                    const TrackList = {
                        index: length,
                        _track_: TEXT_T
                    };
                    __classPrivateFieldGet(this, _SrtParser_track_lists, "f").push(TrackList);
                    const track = {
                        name: Track.name,
                        label: Track.label,
                        language: Track.language,
                        default: Track.default,
                        url: Track.url,
                        data
                    };
                    __classPrivateFieldGet(this, _SrtParser_tracks, "f").set(length, track);
                }));
            }
            catch (_a) {
                throw Error("object does not have expected patterns!");
            }
        });
    }
    request(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(url);
            return yield res.text();
        });
    }
    append_media(media) {
        __classPrivateFieldSet(this, _SrtParser_media, media, "f");
    }
    GetKey(key) {
        return __classPrivateFieldGet(this, _SrtParser_caption, "f").get(String(key));
    }
    GetKeyFromTime(time, delimiter) {
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaElement = __classPrivateFieldGet(this, _SrtParser_media, "f");
            const textTracks = mediaElement.textTracks;
            let _this = this;
            mediaElement.textTracks.addEventListener('change', (e) => {
                const textTracks = mediaElement.textTracks;
                for (let i = 0; i < textTracks.length; i++) {
                    const track = textTracks[i];
                    if (track.mode === 'showing' && __classPrivateFieldGet(this, _SrtParser_current, "f") != i) {
                        const find = __classPrivateFieldGet(this, _SrtParser_tracks, "f").get(Number(i));
                        if (!(find === null || find === void 0 ? void 0 : find.data))
                            break;
                        clearAllTextTracks(mediaElement);
                        __classPrivateFieldSet(this, _SrtParser_caption, find === null || find === void 0 ? void 0 : find.data, "f");
                        __classPrivateFieldSet(this, _SrtParser_current, i, "f");
                        init_caption();
                        break;
                    }
                }
            });
            function run_std_out(final, currentTime) {
                var _a;
                let captions = [];
                const filter = final.filter(c => c.init / 1000 <= currentTime && c.end / 1000 >= currentTime);
                if (filter.length == 0) {
                    __classPrivateFieldGet(_this, _SrtParser__stdout, "f").innerText = "";
                    return;
                }
                captions = (_a = __classPrivateFieldGet(_this, _SrtParser_caption, "f").get(String(filter[0].index))) === null || _a === void 0 ? void 0 : _a.captions.reverse();
                __classPrivateFieldGet(_this, _SrtParser__stdout, "f").innerText = captions.join('\n');
            }
            function clearCuesFromTrack(track) {
                if (!track)
                    throw Error("Caption not found!");
                if (track.cues) {
                    const cues = track.cues;
                    while (cues.length > 0) {
                        track.removeCue(cues[0]);
                    }
                }
            }
            function clearAllTextTracks(videoElement) {
                const textTracks = videoElement.textTracks;
                for (let i = 0; i < textTracks.length; i++) {
                    clearCuesFromTrack(textTracks[i]);
                }
            }
            function convert_to_number(label) {
                const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/g;
                let match;
                const groups = [];
                while ((match = regex.exec(label)) !== null) {
                    groups.push({
                        hours: Number(match[1]),
                        minutes: Number(match[2]),
                        seconds: Number(match[3]),
                        milliseconds: Number(match[4])
                    });
                }
                return groups;
            }
            function init_caption() {
                var _a;
                const captions = Array.from(__classPrivateFieldGet(_this, _SrtParser_caption, "f").values());
                let index = 1;
                let final_captions = [];
                for (const e of captions) {
                    const time_reffer = { init: convert_to_number(e.init), end: convert_to_number(e.end) };
                    const from_sec = [(time_reffer.init[0].hours * 60 + time_reffer.init[0].minutes) * 60 + time_reffer.init[0].seconds, (time_reffer.end[0].hours * 60 + time_reffer.end[0].minutes) * 60 + time_reffer.end[0].seconds];
                    const from_millis = from_sec.map((sec, index) => {
                        return (index == 0) ? Number((sec * 1000) + time_reffer.init[0].milliseconds) : Number((sec * 1000) + time_reffer.end[0].milliseconds);
                    });
                    const caption_mapped_ = {
                        init: from_millis[0],
                        end: from_millis[1],
                        index: index
                    };
                    final_captions.push(caption_mapped_);
                    index += 1;
                }
                const find = __classPrivateFieldGet(_this, _SrtParser_track_lists, "f").find(e => e.index == __classPrivateFieldGet(_this, _SrtParser_current, "f"));
                let caption_from_media = find === null || find === void 0 ? void 0 : find._track_;
                if (!caption_from_media)
                    return;
                if (__classPrivateFieldGet(_this, _SrtParser__stdout, "f")) {
                    function timeUpdateHandler() {
                        run_std_out(final_captions, mediaElement.currentTime);
                    }
                    mediaElement.removeEventListener('timeupdate', timeUpdateHandler);
                    mediaElement.addEventListener('timeupdate', timeUpdateHandler);
                }
                caption_from_media.mode = "showing";
                for (const track of final_captions) {
                    (_a = __classPrivateFieldGet(_this, _SrtParser_caption, "f").get(String(track.index))) === null || _a === void 0 ? void 0 : _a.captions.reverse().forEach((c, i) => {
                        const init = track.init / 1000;
                        const end = track.end / 1000;
                        caption_from_media.addCue(new VTTCue(init, end, String(c)));
                    });
                }
            }
            /* this.#Process();
            
    let caption_from_media:TextTrack = media.addTextTrack("captions", "Caption", "pt-BR");
    caption_from_media.mode = "showing";
             for(const track of final_captions){
                this.#caption.get(String(track.index))?.captions.reverse().forEach((c,i)=>{
                    console.log(i,c,track.init/1000)
                    const init = track.init/1000;
                    const end = track.end/1000;
                    caption_from_media.addCue(new VTTCue(init, end, String(c)));
                })
             }*/
        });
    }
}
_SrtParser_input = new WeakMap(), _SrtParser_current = new WeakMap(), _SrtParser_caption = new WeakMap(), _SrtParser_tracks = new WeakMap(), _SrtParser__stdout = new WeakMap(), _SrtParser_media = new WeakMap(), _SrtParser_track_lists = new WeakMap(), _SrtParser_instances = new WeakSet(), _SrtParser_Process = function _SrtParser_Process() {
    const input = __classPrivateFieldGet(this, _SrtParser_input, "f");
    const res = new Map();
    const regex = /(\r\n|\r|\n)/g;
    if (!input)
        return false;
    const sliced_input = input.split(regex).filter(slice => { return !slice.match(regex) && slice != ""; });
    let number = -1;
    let i = 0;
    let _caption;
    const array_regex = [/^\d+$/, /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/];
    while (i < sliced_input.length) {
        if (array_regex[0].test(sliced_input[i])) {
            if (number !== -1 || i == sliced_input.length - 1) {
                res.set(String(number), _caption);
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
            res.set(String(number), _caption);
        }
    }
    return res;
};
