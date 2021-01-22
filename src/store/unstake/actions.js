import notifyAlert from 'src/services/notify-alert'
import { RpcError } from 'eosjs'

export const actionUnstake = async function ({ state }) {
  try {
    const result = await this.$transit.eosApi.transact({
      actions: [{
        account: process.env.AIRCLAIM_CONTRACT,
        name: 'unstake',
        authorization: [{
          actor: this.$transit.wallet.auth.accountName,
          permission: this.$transit.wallet.auth.permission
        }],
        data: {
          user: this.$transit.wallet.auth.accountName
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    })

    if (result.processed.receipt.status === 'executed') {
      notifyAlert('success', result.processed.action_traces[0].console)
    } else {
      notifyAlert('err', 'The action could not be completed. Please try later')
    }
    return result
  } catch (e) {
    if (e.message === 'UnAuthorized') {
      notifyAlert('err', 'Please check that your wallet contains the correct keys for the account you are trying to register')
    } else if (e.message.startsWith('assertion failure with message: ')) {
      notifyAlert('err', e.message.split('assertion failure with message: ')[1])
    } else if (e.message === 'unrecognized private key type') {
      notifyAlert('err', 'There is a problem with your private key. Please check your wallet has the correct key(s)')
    } else if (e instanceof RpcError || e instanceof TypeError) {
      notifyAlert('err', 'Connection error. Please try later') // Notify in red
    } else {
      notifyAlert('err', 'The action could not be completed. Please try later')
    }
  }
}
