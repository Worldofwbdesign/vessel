import {Table, Column, Model, DataType, AutoIncrement, CreatedAt, UpdatedAt, DeletedAt, PrimaryKey, BelongsTo} from 'sequelize-typescript';
import { Moment } from 'moment';
import Vessel from './vessel';
import PortCall from './port-call';
 
@Table({
  tableName: 'port_call_history', 
  underscored: true,
})
export default class PortCallHistory extends Model<PortCallHistory> {
 
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.INTEGER)
  actionMode: string;
 
  @Column(DataType.DATE)
  cursor: Moment;

  @Column(DataType.DATE)
  arrival: Moment;

  @Column(DataType.DATE)
  departure: Moment;

  @Column(DataType.STRING)
  portId: string;

  @Column(DataType.STRING)
  portName: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdDate: Moment;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedDate: Moment;

  @DeletedAt
  @Column(DataType.DATE)
  deletedDate: Moment;

  @BelongsTo(() => Vessel, 'vessel_imo')
  vessel: Vessel;

  @BelongsTo(() => PortCall, 'port_call_id')
  portCall: PortCall;
}
