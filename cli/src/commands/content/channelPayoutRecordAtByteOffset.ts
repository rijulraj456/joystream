import { channelPayoutRecordAtByteOffset } from '@joystreamjs/content'
import { Command, flags } from '@oclif/command'
import { displayCollapsedRow } from '../../helpers/display'

export default class ChannelPayoutRecordAtByteOffset extends Command {
  static description = 'Get channel payout record from serialized payload at given byte.'
  static flags = {
    path: flags.string({
      required: false,
      description: 'Path to the serialized payload file',
      exclusive: ['url'],
    }),
    url: flags.string({
      required: false,
      description: 'URL to the serialized payload file',
      exclusive: ['path'],
    }),
  }

  static args = [
    {
      name: 'byteOffset',
      required: true,
      description: 'Byte offset of payout record from start of payload',
    },
  ]

  async run(): Promise<void> {
    const { path, url } = this.parse(ChannelPayoutRecordAtByteOffset).flags
    const { byteOffset } = this.parse(ChannelPayoutRecordAtByteOffset).args
    const start = Number.parseInt(byteOffset as string)

    try {
      if (!(path || url)) {
        this.error('One of path or url should be provided')
      }

      const payoutRecord = path
        ? await channelPayoutRecordAtByteOffset('PATH', path, start)
        : await channelPayoutRecordAtByteOffset('URL', url!, start)

      displayCollapsedRow({
        'Channel Id': payoutRecord.channelId,
        'Cumulative Payout Earned': payoutRecord.cumulativeRewardEarned,
        'Merkle Proof Branch': JSON.stringify(payoutRecord.merkleBranch),
        'Payout Rationale': payoutRecord.payoutRationale,
      })
    } catch (error) {
      this.error(`Invalid byte offset for payout record ${error}`)
    }
  }
}
