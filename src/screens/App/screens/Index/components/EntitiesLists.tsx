import { Observable, combineLatest, of } from 'rxjs'
import { map, distinctUntilChanged, switchMap, pluck } from 'rxjs/operators'
import { authCollection } from '../../../../../shared/firebase'
import { sortUnits } from '../../../../shared/utils'
import { componentFromStream } from 'recompose'

interface ExtraProps {
  [key: string]: any
}
interface PropertiesListProps {
  orderBy?: OrderByTuple
  children(data: { properties: Property[] } & ExtraProps): React.ReactNode
}
export const PropertiesList = componentFromStream<PropertiesListProps>(
  props$ => {
    const data$ = combineLatest(
      props$ as Observable<PropertiesListProps>,
      authCollection<Property>('properties', { orderBy: ['name'] }),
    )
    return data$.pipe(
      map(([{ children, ...rest }, properties]) =>
        children({ ...rest, properties }),
      ),
    )
  },
)

interface UnitsListProps {
  selectedProperty?: string
  children(data: { units: Unit[] } & ExtraProps): React.ReactNode
}
export const UnitsList = componentFromStream<UnitsListProps>(props$ => {
  const data$ = combineLatest(
    props$ as Observable<UnitsListProps>,
    (props$ as Observable<UnitsListProps>).pipe(
      pluck('selectedProperty'),
      distinctUntilChanged(),
      switchMap(
        sp => (sp ? authCollection<Unit>(`properties/${sp}/units`) : of([])),
      ),
    ),
  )
  return data$.pipe(
    map(([{ children, ...rest }, units]) =>
      children({ ...rest, units: sortUnits(units) }),
    ),
  )
})

interface TenantsListProps {
  children(data: { tenants: Tenant[] } & ExtraProps): React.ReactNode
}
export const TenantsList = componentFromStream<TenantsListProps>(props$ => {
  const data$ = combineLatest(
    props$ as Observable<TenantsListProps>,
    authCollection<Tenant>('tenants', { orderBy: ['lastName'] }),
  )
  return data$.pipe(
    map(([{ children, ...rest }, tenants]) => children({ ...rest, tenants })),
  )
})
