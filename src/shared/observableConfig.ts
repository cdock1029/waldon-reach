import { from } from 'rxjs'
import { setObservableConfig } from 'recompose'
const config: any = {
  fromESObservable: from,
}
setObservableConfig(config)
