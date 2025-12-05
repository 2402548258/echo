import { MENU_IDS } from "@common/constants"

export async function createMenu(menuId: MENU_IDS, cb?: (id: string) => void, dynamicOptions?: { label?: string, id: string, [key: string]: any }[]) {
    let result = ''
    window.api.contextMenuItemClick(menuId, (id)=> {
        cb?.(menuId)
        result = id
    })
    await window.api.showContextMenu(menuId,JSON.stringify(dynamicOptions))
    window.api.removeContextMenuListener(menuId)
    return result
}