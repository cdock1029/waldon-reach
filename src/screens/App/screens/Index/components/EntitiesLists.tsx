import { SFC } from 'react'
import { streamProps } from 'react-streams'
import { Observable, combineLatest, of } from 'rxjs'
import { map, distinctUntilChanged, switchMap, pluck } from 'rxjs/operators'
import { authCollection } from '../../../../../shared/firebase'
import { sortUnits } from '../../../../shared/utils'

interface ExtraProps {
  [key: string]: any
}
export const PropertiesList: SFC<{
  children(data: { properties: Property[] } & ExtraProps): any
}> = streamProps((props$: Observable<{ orderBy?: OrderByTuple }>) =>
  combineLatest(
    props$,
    props$.pipe(
      pluck('orderBy'),
      distinctUntilChanged(),
      switchMap<any, Property[]>((orderBy?: OrderByTuple) =>
        authCollection<Property>('properties', {
          orderBy: orderBy ? orderBy : ['name'],
        }),
      ),
    ),
  ).pipe(
    map(([{ orderBy, ...rest }, properties]) => ({ ...rest, properties })),
  ),
) as any

export const UnitsList: SFC<{
  children(data: { units: Unit[] }): any
}> = streamProps((props$: Observable<any>) =>
  combineLatest(
    props$,
    props$.pipe(
      pluck('selectedProperty'),
      distinctUntilChanged(),
      switchMap(
        sp => (sp ? authCollection<Unit>(`properties/${sp}/units`) : of([])),
      ),
    ),
  ).pipe(map(([props, units]) => ({ ...props, units: sortUnits(units) }))),
) as any

export const TenantsList: SFC<{
  children(data: { tenants: Tenant[] }): any
}> = streamProps((props$: any) =>
  combineLatest(
    props$,
    authCollection<Tenant>('tenants', { orderBy: ['lastName'] }),
  ).pipe(map(([props, tenants]) => ({ ...props, tenants }))),
) as any
