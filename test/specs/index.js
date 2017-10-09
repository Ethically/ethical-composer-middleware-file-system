import { join } from 'path'
import { emptyDirSync, pathExistsSync } from 'fs-extra'
import Vinyl from 'vinyl'
import fileSystemMiddleware from '../../src/index.js'

const destPath = join(process.cwd(), 'test', 'files')
const defaultPath = join(process.cwd(), 'src', 'location', 'file.js')
const contents = new Buffer('//')
const file = (map, path = defaultPath) => new Vinyl({ path, contents, map })

describe('fileSystemMiddleware()', () => {
    afterEach(() => {
        emptyDirSync(destPath)
    })

    it('should save relative file to a destination on disk', async (done) => {
        const next = jasmine.createSpy('next')
        const config = { dest: 'test/files/dest.js' }
        await fileSystemMiddleware(config)({ file: file() }, next)
        const destFile = join(destPath, 'dest.js')
        expect(pathExistsSync(destFile)).toBe(true)
        expect(next).toHaveBeenCalled()
        done()
    })

    it('should save absolute file to a destination on disk', async (done) => {
        const next = jasmine.createSpy('next')
        const destFile = join(destPath, 'dest.js')
        const config = { dest: destFile }
        await fileSystemMiddleware(config)({ file: file() }, next)
        expect(pathExistsSync(destFile)).toBe(true)
        expect(next).toHaveBeenCalled()
        done()
    })

    it('should save source map to a destination on disk', async (done) => {
        const next = jasmine.createSpy('next')
        const destFile = join(destPath, 'dest.js')
        const destFileMap = destFile + '.map'
        const config = { dest: destFile }
        await fileSystemMiddleware(config)({ file: file('map') }, next)
        expect(pathExistsSync(destFile)).toBe(true)
        expect(pathExistsSync(destFileMap)).toBe(true)
        expect(next).toHaveBeenCalled()
        done()
    })

    it('should save file on the disk relative to a base path', async (done) => {
        const next = jasmine.createSpy('next')
        const config = { dest: 'test/files/dist', base: 'src' }
        await fileSystemMiddleware(config)({ file: file() }, next)
        const destFile = join(destPath, 'file.js')
        expect(pathExistsSync(destPath.replace('src', 'dist'))).toBe(true)
        expect(next).toHaveBeenCalled()
        done()
    })

    it('should require that the user provide a file destination', async (done) => {
        try {
            await fileSystemMiddleware()({}, () => {})
        } catch (e) {
            done()
        }
    })
})
