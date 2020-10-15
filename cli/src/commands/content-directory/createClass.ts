import ContentDirectoryCommandBase from '../../base/ContentDirectoryCommandBase'
import CreateClassSchema from 'cd-schemas/schemas/extrinsics/CreateClass.schema.json'
import { CreateClass } from 'cd-schemas/types/extrinsics/CreateClass'
import { InputParser } from 'cd-schemas'
import { JsonSchemaPrompter, JsonSchemaCustomPrompts } from '../../helpers/JsonSchemaPrompt'
import { JSONSchema } from '@apidevtools/json-schema-ref-parser'
import { IOFlags, getInputJson, saveOutputJson } from '../../helpers/InputOutput'

export default class CreateClassCommand extends ContentDirectoryCommandBase {
  static description = 'Create class inside content directory. Requires lead access.'
  static flags = {
    ...IOFlags,
  }

  async run() {
    const account = await this.getRequiredSelectedAccount()
    await this.requireLead()

    const { input, output } = this.parse(CreateClassCommand).flags
    const existingClassnames = (await this.getApi().availableClasses()).map(([, aClass]) => aClass.name.toString())

    let inputJson = await getInputJson<CreateClass>(input, CreateClassSchema as JSONSchema)
    if (!inputJson) {
      const customPrompts: JsonSchemaCustomPrompts<CreateClass> = [
        [
          'name',
          {
            validate: (className) => existingClassnames.includes(className) && 'A class with this name already exists!',
          },
        ],
        ['class_permissions.maintainers', () => this.promptForCuratorGroups('Select class maintainers')],
      ]

      const prompter = new JsonSchemaPrompter<CreateClass>(CreateClassSchema as JSONSchema, undefined, customPrompts)

      inputJson = await prompter.promptAll()
    }

    this.jsonPrettyPrint(JSON.stringify(inputJson))
    const confirmed = await this.simplePrompt({ type: 'confirm', message: 'Do you confirm the provided input?' })

    if (confirmed) {
      await this.requestAccountDecoding(account)
      this.log('Sending the extrinsic...')
      const inputParser = new InputParser(this.getOriginalApi())
      await this.sendAndFollowTx(account, inputParser.parseCreateClassExtrinsic(inputJson), true)

      saveOutputJson(output, `${inputJson.name}Class.json`, inputJson)
    }
  }
}
