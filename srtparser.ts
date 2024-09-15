interface caption{
    init:string,
    end:string,
    captions:Array<string>,
}
interface TimeGroup {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  }
  interface CaptionMapped {
    init:number,
    end:number,
    index:number
    }

    interface Track{
        name:string,
        language:string,
        label:string,
        default:boolean,
        url:string,
        data:Map<string,caption> | boolean
    }
    interface Text_Track{
        index:number,
        _track_:TextTrack
    }
export class SrtParser{
    #input:string;
    #current:number;
    #caption:Map<string,caption>  = new Map()
    #tracks:Map<number,Track> = new Map();
    #_stdout:HTMLElement;
    #media:HTMLVideoElement | HTMLAudioElement;
    #track_lists:Array<Text_Track> = [];

    set stdout(elem:HTMLElement){
    this.#_stdout = elem;
    }
    async SetCaptions(TrackObject:Array<Track>){
        try{
             TrackObject.forEach(async (Track:Track)=>{
                console.log(Track.url)
                const res = await this.request(Track.url)
                this.#input = res;
                let data:Map<string,caption> | boolean = this.#Process();
                const media = this.#media;
                const TEXT_T:TextTrack = media.addTextTrack("captions", Track.label, Track.language);
                const length = this.#tracks.size;
                const TrackList:Text_Track = {
                    index:length,
                   _track_:TEXT_T
                }
                this.#track_lists.push(TrackList)
                const track:Track = {
                    name:Track.name,
                    label:Track.label,
                    language:Track.language,
                    default:Track.default,
                    url:Track.url,
                    data
                }
                this.#tracks.set(length,track)
                
             })
            
            
            
           }
          catch{
            throw Error("object does not have expected patterns!")
          }
    }
    async request(url:string){
    const res = await fetch(url)
    return await res.text()
    }

     append_media(media:HTMLVideoElement | HTMLAudioElement){
      this.#media = media;
     }

     #Process():Map<string,caption> | boolean{
        const input = this.#input;
        const res:Map<string,caption> = new Map()
       const regex = /(\r\n|\r|\n)/g
       if(!input)return false
       const sliced_input = input.split(regex).filter(slice=> {return !slice.match(regex) && slice != ""});
       let number = -1;
       let i = 0;
       let _caption: caption;
       const array_regex: Array<RegExp> = [/^\d+$/,  /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/ ];
       while(i < sliced_input.length){
        if(array_regex[0].test(sliced_input[i])){
        if(number !== -1 || i == sliced_input.length-1){
            res.set(String(number),_caption!);
        }
        
        number = Number(sliced_input[i])
        _caption = {
            init: '',
            end: '',
            captions: []
          };
        }

        else if(array_regex[1].test(sliced_input[i])){
            const match = sliced_input[i].match(array_regex[1])
            _caption!.init = match![1];
            _caption!.end = match![2];  
        }
        
        else{
           _caption!.captions.push(sliced_input[i])
        }
        i+=1
        if (number !== -1) {
            res.set(String(number), _caption!);
          }
       }
       return res;
    }
    GetKey(key:number){
        return this.#caption.get(String(key))
    }
    GetKeyFromTime(time:string | number,delimiter:string | number){
      
    }
    async run(){
        const mediaElement = this.#media;
        const textTracks = mediaElement.textTracks;
        let _this = this;
        mediaElement.textTracks.addEventListener('change', (e) => {
            const textTracks = mediaElement.textTracks;
            for (let i = 0; i < textTracks.length; i++) {
                const track = textTracks[i];
                if (track.mode === 'showing' && this.#current != i) {
                    const find = this.#tracks.get(Number(i))
                    if(!find?.data)break
                    clearAllTextTracks(mediaElement)
                    this.#caption = find?.data as Map<string,caption>;
                    this.#current = i;
                    init_caption();
                    
                    break
                }
            }
        });
        function run_std_out(final: Array<CaptionMapped>,currentTime:number) {
            let captions:Array<string> | undefined = [];
            const filter = final.filter(c=>c.init/1000 <= currentTime && c.end/1000 >= currentTime);
            if(filter!.length == 0){
                _this.#_stdout.innerText = "";
                return
            }
            captions = _this.#caption.get(String(filter[0].index))?.captions.reverse();
           _this.#_stdout.innerText  = captions!.join('\n');
    }
        function clearCuesFromTrack(track: TextTrack | undefined) {
            if(!track) throw Error("Caption not found!")
            if (track.cues) {
                const cues = track.cues;
                while (cues.length > 0) {
                    track.removeCue(cues[0]);
                }
            }
        }
        function clearAllTextTracks(videoElement: HTMLMediaElement) {
            const textTracks = videoElement.textTracks;
            for (let i = 0; i < textTracks.length; i++) {
                clearCuesFromTrack(textTracks[i]);
            }
        }
        function convert_to_number(label:string):TimeGroup []{
            const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/g;
            let match;
            const groups:TimeGroup[] = [];
            
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
        
        function init_caption(){
            const captions = Array.from(_this.#caption.values());            
             let index = 1;
             let final_captions:Array<CaptionMapped> = [];
             for(const e of captions){
                const time_reffer = {init:convert_to_number(e.init),end:convert_to_number(e.end)}
                const from_sec = [(time_reffer.init[0].hours*60 + time_reffer.init[0].minutes) *60 + time_reffer.init[0].seconds,(time_reffer.end[0].hours*60 + time_reffer.end[0].minutes) *60 + time_reffer.end[0].seconds];
                const from_millis = from_sec.map((sec,index)=>{
                    return (index == 0) ? Number((sec * 1000)+time_reffer.init[0].milliseconds) : Number((sec * 1000)+time_reffer.end[0].milliseconds)
                })
                const caption_mapped_: CaptionMapped = {
                    init: from_millis[0], 
                    end: from_millis[1], 
                    index: index  
                };
            
                final_captions.push(caption_mapped_);
                index += 1; 
             }
             const find = _this.#track_lists.find(e=>e.index == _this.#current);
             let caption_from_media:TextTrack | undefined = find?._track_;
             if(!caption_from_media)return
             if(_this.#_stdout){
                function timeUpdateHandler() {
                    run_std_out(final_captions,mediaElement.currentTime);
                }
                mediaElement.removeEventListener('timeupdate',timeUpdateHandler)
                mediaElement.addEventListener('timeupdate',timeUpdateHandler)
             }
             caption_from_media.mode = "showing";
         
             for(const track of final_captions){
            _this.#caption.get(String(track.index))?.captions.reverse().forEach((c,i)=>{
                const init = track.init/1000;
                const end = track.end/1000;

                caption_from_media.addCue(new VTTCue(init, end, String(c)));
            })
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
    }
}