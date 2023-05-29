import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventTrackerService } from 'src/event-tracker/event-tracker.service';
import { lzEndpointAbi } from '../abi/lzEndpointAbi';
import { multisigAbi } from '../abi/multisigAbi';
import { Web3Service } from "nest-web3";
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/typeorm';
import { Repository } from 'typeorm';

export interface IBridgeEvent {
  transactionHash: string;
  blockNumber: number;
  srcChainId: string;
  srcUaAddress: string;
  dstUaAddress: string;
  srcUaNonce: string;
  payloadHash: string;
  from: string;
  to: string;
  amount: string;
  dstChainId: string;
}

enum CHAIN {
  BSC = 'bsc',
  ETH = 'eth',
  HMY = 'hmy',
}

enum EVENT {
  'ExecutionFailure' = 'ExecutionFailure',
  'PayloadStored' = 'PayloadStored',
}

interface IEventFilterParams extends IBridgeEvent {
  chain: CHAIN,
  event: EVENT
  size: number,
  page: number,
}

const createDefaultCache = () => {
  return {
    [CHAIN.BSC]: [],
    [CHAIN.ETH]: [],
    [CHAIN.HMY]: [],
  }
}

@Injectable()
export class ErrorTrackerService {
  private readonly logger = new Logger(ErrorTrackerService.name);

  private bscEventTracker: EventTrackerService;
  private ethEventTracker: EventTrackerService;

  private hmyLzEndpointTracker: EventTrackerService;
  private hmyMultisigTracker: EventTrackerService;

  events: Record<EVENT, Record<CHAIN, IBridgeEvent[]>> = {
    [EVENT.ExecutionFailure]: createDefaultCache(),
    [EVENT.PayloadStored]: createDefaultCache(),
  }

  constructor(
    private configService: ConfigService,
    private readonly web3Service: Web3Service,
    @InjectRepository(Events)
    private eventsRep: Repository<Events>,
  ) {
    // this.bscEventTracker = new EventTrackerService({
    //   chain: CHAIN.BSC,
    //   web3: this.web3Service.getClient(CHAIN.BSC),
    //   contractAbi: lzEndpointAbi,
    //   contractAddress: this.configService.get(CHAIN.BSC).lzEndpointContract,
    //   eventName: 'PayloadStored',
    //   getEventCallback: async (res) => {
    //     if (res?.name === 'PayloadStored') {
    //       console.log(res);
    //     }
    //   }
    // });

    // this.bscEventTracker.start();

    // this.ethEventTracker = new EventTrackerService({
    //   chain: CHAIN.ETH,
    //   web3: this.web3Service.getClient(CHAIN.ETH),
    //   contractAbi: lzEndpointAbi,
    //   contractAddress: this.configService.get(CHAIN.ETH).lzEndpointContract,
    //   eventName: 'PacketReceived',
    //   getEventCallback: async (res) => {
    //     if (res?.name === 'PayloadStored') {
    //       console.log(res);
    //     }
    //   }
    // });

    // this.ethEventTracker.start();

    this.hmyLzEndpointTracker = new EventTrackerService({
      chain: CHAIN.HMY,
      web3: this.web3Service.getClient(CHAIN.HMY),
      contractAbi: lzEndpointAbi,
      contractAddress: this.configService.get(CHAIN.HMY).lzEndpointContract,
      eventName: 'PayloadStored',
      getEventCallback: async (res) => {
        if (res?.name === 'PayloadStored') {
          if (!await this.eventsRep.findOneBy({ transactionHash: res.transactionHash })) {
            await this.eventsRep.save({
              name: 'PayloadStored',
              transactionHash: res.transactionHash,
              blockNumber: res.blockNumber,
              address: res.address,
              payload: res,
              chain: CHAIN.HMY
            });
          }
        }
      }
    });

    this.hmyMultisigTracker = new EventTrackerService({
      chain: CHAIN.HMY,
      web3: this.web3Service.getClient(CHAIN.HMY),
      contractAbi: multisigAbi,
      contractAddress: this.configService.get(CHAIN.HMY).multisigContract,
      eventName: 'ExecutionFailure',
      getEventCallback: async (res) => {
        if (res?.name === 'ExecutionFailure') {
          if (!await this.eventsRep.findOneBy({ transactionHash: res.transactionHash })) {
            await this.eventsRep.save({
              name: 'ExecutionFailure',
              transactionHash: res.transactionHash,
              blockNumber: res.blockNumber,
              address: res.address,
              payload: res,
              chain: CHAIN.HMY
            });
          }
        }
      }
    });
  }

  async start() {
    try {
      const lastRec = await this.eventsRep.findOne({
        where: [{ name: 'ExecutionFailure' }],
        order: { id: 'DESC' }
      })
      this.hmyMultisigTracker.setStartBlock(Number(lastRec?.blockNumber || 0));
      this.hmyMultisigTracker.start();
    } catch (e) {
      this.logger.error(`Start hmyMultisigTracker Error`, e);
    }

    try {
      const lastRec = await this.eventsRep.findOne({
        where: [{ name: 'PayloadStored' }],
        order: { id: 'DESC' }
      })
      this.hmyLzEndpointTracker.setStartBlock(Number(lastRec?.blockNumber || 0));
      this.hmyLzEndpointTracker.start();
    } catch (e) {
      this.logger.error(`Start hmyMultisigTracker Error`, e);
    }
  }

  async getTransfers() {
    return await this.eventsRep.findAndCount({ take: 100 });
  }

  getInfo = () => {
    return {
      hmyLzEndpoint: {
        info: this.hmyLzEndpointTracker.getInfo(),
        events: this.events[EVENT.PayloadStored][CHAIN.HMY].length,
      },
      hmyMultisig: {
        info: this.hmyMultisigTracker.getInfo(),
        events: this.events[EVENT.ExecutionFailure][CHAIN.HMY].length,
      }
    }
  }

  getEvents = async (filters: IEventFilterParams) => {
    const {
      chain = CHAIN.HMY,
      event = EVENT.ExecutionFailure,
      size = 10,
      page = 0,
      transactionHash,
    } = filters;

    return await this.eventsRep.findAndCount({
      where: { name: event, chain: chain },
      order: { id: 'DESC' },
      take: size,
      skip: page * size
    });
  }
}