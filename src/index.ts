import {readFileSync} from 'fs';
import type {HmrContext} from 'vite';

type KeyVals = undefined|{[key: string]: string}

const end = "?strict?uvals"

function match(id:string){
  if(id.slice(-end.length) !== end) {
    return null
  }
  return id.slice(0, -end.length)
}

const stylusRegEx = /^\s*(?<k>\S*)\s*=\s*(?<v>.*)\s*;?\s*$/
function stylusParse(line:string): KeyVals{
  return line.match(stylusRegEx)?.groups
}


function transform(code:string, parse:(line: string) => KeyVals) {
  const input = code.split('\n')
  return (input
    .map((line) => {
      const res = parse(line)
      console.log({
        'line' : line,
        'res' : res,
      });
      if(!res) {
        return undefined
      }
      const {k, v} = res
      return 'export const ' + k + ' = "' + v + '";'
    })
    .filter( (line) => line !== undefined )
    .join('\n')
  )
}

console.log('UVALS')

export default function uvals(){
  return {
    name : 'uvals',
    // async resolveId(source:string, importer:string):Promise<any>{
    //   const new_source = match(source);
    //   if(new_source === null) {
    //     return null
    //   }
    //   const resolved = await (this as any).resolve(new_source, importer)
    //   console.log({
    //     'A' : 'UVALS resolveId',
    //     'source' : source,
    //     'resolved' : resolved,
    //   });
    //   if(resolved?.id) {
    //     return resolved.id + end
    //   }
    //   return null
    // },
    // load(id:string):any{
    //   const new_id = match(id)
    //   if(new_id === null) {
    //     return null 
    //   }
    //   console.log({
    //     'A' : 'UVALS Load',
    //     'id' : id,
    //   });
    //   return readFileSync(new_id, 'utf-8' )
    // },
    transform(code: string, id:string):any{
      const new_id = match(id)
      if(new_id === null) {
        return null 
      }
      console.log({
        'A' : 'UVALS Transform',
        'id' : id,
        'code': code,
      });
      (this as any).addWatchFile(new_id)
      return {
        code: transform(code, stylusParse),
        map: {
          sources : [new_id],
          mappings : ''
        }
      }
    },
    handleHotUpdate(ctx:HmrContext):any{
      console.log({
        'A': 'UVALS Hot reload',
        'ctx' : ctx,
        'ctx.modules' : ctx.modules,
      })
    }
  }
}
