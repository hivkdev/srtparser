
interface caption{
    init:string,
    end:string,
    captions:Array<string>
}
export class SrtParser{
    #input:string;
    #caption:Map<string,caption> = new Map()
    constructor(input:string){
     this.#input = input;
    }
    lexer(){
        const input = this.#input;
    }
    GetKey(key:number){
        return this.#caption.get(String(key))
    }
    async run(){
       const input = this.#input;
       const regex = /(\r\n|\r|\n)/g
       const sliced_input = input.split(regex).filter(slice=> {return !slice.match(/(\r\n|\r|\n)/g) && slice != ""});
       let number = -1;
       let i = 0;
       let _caption: caption;
       const array_regex: Array<RegExp> = [/^\d+$/,  /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/ ];
       while(i < sliced_input.length){
        if(array_regex[0].test(sliced_input[i])){
        if(number !== -1 || i == sliced_input.length-1){
            this.#caption.set(String(number),_caption!);
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
            this.#caption.set(String(number), _caption!);
          }
       }
    }
}