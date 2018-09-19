import { streamProps } from 'react-streams'
import { Observable, combineLatest, of } from 'rxjs'
import { map, distinctUntilChanged, switchMap, pluck } from 'rxjs/operators'
import { authCollection } from '../../../../../shared/firebase'
import { sortUnits } from '../../../../shared/utils'

export const PropertiesList: any = streamProps((props$: any) =>
  combineLatest(
    props$,
    authCollection<Property>('properties', { orderBy: ['name'] }),
  ).pipe(map(([props, properties]) => ({ ...props, properties }))),
)

export const UnitsList: any = streamProps((props$: Observable<any>) =>
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
)

export const TenantsList: any = streamProps((props$: any) =>
  combineLatest(
    props$,
    authCollection<Tenant>('tenants', { orderBy: ['lastName'] }),
  ).pipe(map(([props, tenants]) => ({ ...props, tenants }))),
)
