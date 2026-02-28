import type { BaiYueKuiShard } from '@shared/yuekui-shard/interface'
import type { Credentials } from 'league-connect'

import { protocol, net } from 'electron'
import { Shard } from '@shared/yuekui-shard/decorators'
import { lcuState } from '../Lcu-state/state'

/**
 * 图片代理协议的配置项。
 */
export interface ImgProtocolOptions {
  /** 协议前缀名称 */
  scheme: string
  /** 获取 LCU 凭据的闭包函数，确保每次请求能拿到最新凭据 */
  getCredentials: () => Credentials | null | undefined
}

/**
 * 注册系统级的图片代理协议，用于绕过跨域并带上 LCU 认证信息。
 *
 * @param opts.scheme - 协议前缀名称 (例如: 'lcu-img')
 * @param opts.getCredentials - 获取凭据的方法 (例如: () => lcuState.credential)
 * @returns 销毁函数，调用后可注销该协议
 */
export const registerImgProtocol = (opts: ImgProtocolOptions): (() => void) => {
  if (protocol.isProtocolHandled(opts.scheme)) return () => undefined

  protocol.handle(opts.scheme, async (request) => {
    const creds = opts.getCredentials()
    if (!creds) return new Response('LCU Not Connected', { status: 503 })

    let urlObj: URL
    try {
      urlObj = new URL(request.url)
    } catch {
      return new Response('Bad Request', { status: 400 })
    }

    const fullPath = urlObj.hostname + urlObj.pathname + urlObj.search
    const lcuUrl = `https://127.0.0.1:${creds.port}/${fullPath}`
    const auth = Buffer.from(`riot:${creds.password}`, 'utf-8').toString('base64')

    try {
      const response = await net.fetch(lcuUrl, {
        headers: { Authorization: `Basic ${auth}` },
        bypassCustomProtocolHandlers: true
      })
      return response
    } catch {
      return new Response('Image Load Failed', { status: 404 })
    }
  })

  return () => {
    if (!protocol.isProtocolHandled(opts.scheme)) return
    void protocol.unhandle(opts.scheme)
  }
}

const SHARD_ID = 'system-protocol'

@Shard(SHARD_ID)
export class SystemProtocolShard implements BaiYueKuiShard {
  id: string = SHARD_ID
  static id = SHARD_ID
  private _disposeFns: Array<() => void> = []

  async onInit(): Promise<void> {
    const disposeImg = registerImgProtocol({
      scheme: 'lcu-img',
      getCredentials: () => lcuState.credential
    })
    this._disposeFns.push(disposeImg)
  }

  onDispose(): void {
    this._disposeFns.forEach((d) => d())
    this._disposeFns = []
  }
}
