import {z} from 'zod'

const spanSchema = z.tuple([z.number(), z.number(), z.number()])

const valueSchema = z.union([
  z.number(),
  z.string(),
  z.string(), // Buffer
])

const commentsSchema = z.array(z.string())

// We don't support socket / plug https://www.rfc-editor.org/rfc/rfc8610.html#section-3.9
const identifierSchema = z.object({
  ident: z.string(),
  span: spanSchema,
})

const genericParamSchema = z.object({
  param: identifierSchema,
  comments_before_ident: z.optional(commentsSchema),
  comments_after_ident: z.optional(commentsSchema),
})

const genericParamsSchema = z.object({
  params: z.array(genericParamSchema),
  span: spanSchema,
})

const occurSchema = z.union([
  z.object({
    Exact: z.object({
      lower: z.optional(z.number()),
      upper: z.optional(z.number()),
      span: spanSchema,
    }),
  }),
  z.object({
    ZeroOrMore: z.object({
      // *
      span: spanSchema,
    }),
  }),
  z.object({
    OneOrMore: z.object({
      // +
      span: spanSchema,
    }),
  }),
  z.object({
    Optional: z.object({
      // ?
      span: spanSchema,
    }),
  }),
])

const occurrenceSchema = z.object({
  occur: occurSchema,
  comments: z.optional(commentsSchema),
})

const rangeCtlOpSchema = z.union([
  z.object({
    RangeOp: z.object({
      is_inclusive: z.boolean(),
      span: spanSchema,
    }),
  }),
  z.object({
    CtlOp: z.object({
      // TODO Do we need this?
      // ctrl: ControlOperator
      span: spanSchema,
    }),
  }),
])

const genericArgSchema = z.object({
  arg: z.lazy(() => type1Schema),
  comments_before_type: z.optional(commentsSchema),
  comments_after_type: z.optional(commentsSchema),
})

const genericArgsSchema = z.object({
  args: z.array(genericArgSchema),
  span: spanSchema,
})

const typeGroupnameEntrySchema = z.object({
  occur: z.optional(occurrenceSchema),
  name: identifierSchema,
  generic_args: z.optional(genericArgsSchema),
})

const baseType1Schema = z.object({
  span: spanSchema,
  comments_after_type: z.optional(commentsSchema),
})

type Type1 = z.infer<typeof baseType1Schema> & {
  type2: z.infer<typeof type2Schema>
  operator?: z.infer<typeof operatorSchema>
}

const type1Schema: z.ZodType<Type1> = baseType1Schema.extend({
  type2: z.lazy(() => type2Schema),
  operator: z.optional(z.lazy(() => operatorSchema)),
})

const typeChoiceSchema = z.object({
  type1: type1Schema,
  comments_before_type: z.optional(commentsSchema),
  comments_after_type: z.optional(commentsSchema),
})

const baseTypeSchema = z.object({
  span: spanSchema,
})

type Type = z.infer<typeof baseTypeSchema> & {
  type_choices: z.infer<typeof typeChoiceSchema>[]
}

const typeSchema: z.ZodType<Type> = baseTypeSchema.extend({
  type_choices: z.array(z.lazy(() => typeChoiceSchema)),
})

const memberKeySchema = z.union([
  z.object({
    Type1: z.object({
      t1: type1Schema,
      is_cut: z.boolean(),
      span: spanSchema,
      comments_before_cut: z.optional(commentsSchema),
      comments_after_cut: z.optional(commentsSchema),
      comments_after_arrowmap: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Bareword: z.object({
      ident: identifierSchema,
      span: spanSchema,
      comments: z.optional(commentsSchema),
      comments_after_colon: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Value: z.object({
      value: valueSchema,
      span: spanSchema,
      comments: z.optional(commentsSchema),
      comments_after_colon: z.optional(commentsSchema),
    }),
  }),
  z.object({
    NonMemberKey: z.object({
      // TODO Do we need this?
      // non_member_key: NonMemberKey
      comments_before_type_or_group: z.optional(commentsSchema),
      comments_after_type_or_group: z.optional(commentsSchema),
    }),
  }),
])

const valueMemberKeyEntrySchema = z.object({
  occur: z.optional(occurrenceSchema),
  member_key: z.optional(memberKeySchema),
  entry_type: typeSchema,
})

const groupEntrySchema = z.union([
  z.object({
    ValueMemberKey: z.object({
      ge: valueMemberKeyEntrySchema,
      span: spanSchema,
      leading_comments: z.optional(commentsSchema),
      trailing_comments: z.optional(commentsSchema),
    }),
  }),
  z.object({
    TypeGroupname: z.object({
      ge: typeGroupnameEntrySchema,
      span: spanSchema,
      leading_comments: z.optional(commentsSchema),
      trailing_comments: z.optional(commentsSchema),
    }),
  }),
  z.object({
    InlineGroup: z.object({
      occur: z.optional(occurrenceSchema),
      group: z.lazy(() => groupSchema),
      span: spanSchema,
      comments_before_group: z.optional(commentsSchema),
      comments_after_group: z.optional(commentsSchema),
    }),
  }),
])

const optionalCommaSchema = z.object({
  optional_comma: z.boolean(),
  trailing_comments: z.optional(commentsSchema),
})

const groupChoiceSchema = z.object({
  group_entries: z.array(z.tuple([groupEntrySchema, optionalCommaSchema])),
  comments: z.optional(z.array(z.string())),
})

const baseGroupSchema = z.object({
  span: spanSchema,
})

type Group = z.infer<typeof baseGroupSchema> & {
  group_choices: z.infer<typeof groupChoiceSchema>[]
}

const groupSchema: z.ZodType<Group> = baseGroupSchema.extend({
  group_choices: z.array(groupChoiceSchema),
})

const type2Schema = z.union([
  z.object({
    IntValue: z.object({
      value: z.number(),
      span: spanSchema,
    }),
  }),
  z.object({
    UintValue: z.object({
      value: z.number(),
      span: spanSchema,
    }),
  }),
  z.object({
    FloatValue: z.object({
      value: z.number(),
      span: spanSchema,
    }),
  }),
  z.object({
    TextValue: z.object({
      value: z.string(),
      span: spanSchema,
    }),
  }),
  z.object({
    UTF8ByteString: z.object({
      value: z.string(), // Buffer
      span: spanSchema,
    }),
  }),
  z.object({
    B16ByteString: z.object({
      value: z.string(), // Buffer
      span: spanSchema,
    }),
  }),
  z.object({
    Typename: z.object({
      ident: identifierSchema,
      generic_args: z.optional(genericArgsSchema),
      span: spanSchema,
    }),
  }),
  z.object({
    ParenthesizedType: z.object({
      pt: z.lazy(() => typeSchema),
      span: spanSchema,
      comments_before_type: z.optional(commentsSchema),
      comments_after_type: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Map: z.object({
      group: groupSchema,
      span: spanSchema,
      comments_before_group: z.optional(commentsSchema),
      comments_after_group: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Array: z.object({
      group: groupSchema,
      span: spanSchema,
      comments_before_group: z.optional(commentsSchema),
      comments_after_group: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Unwrap: z.object({
      ident: identifierSchema,
      generic_args: z.optional(genericArgsSchema),
      span: spanSchema,
      comments: z.optional(commentsSchema),
    }),
  }),
  z.object({
    ChoiceFromInlineGroup: z.object({
      group: groupSchema,
      span: spanSchema,
      comments: z.optional(commentsSchema),
      comments_before_group: z.optional(commentsSchema),
      comments_after_group: z.optional(commentsSchema),
    }),
  }),
  z.object({
    ChoiceFromGroup: z.object({
      ident: identifierSchema,
      generic_args: z.optional(genericArgsSchema),
      span: spanSchema,
      comments: z.optional(commentsSchema),
    }),
  }),
  z.object({
    TaggedData: z.object({
      tag: z.optional(z.number()),
      t: z.lazy(() => typeSchema),
      span: spanSchema,
      comments_before_type: z.optional(commentsSchema),
      comments_after_type: z.optional(commentsSchema),
    }),
  }),
  z.object({
    DataMajorType: z.object({
      mt: z.number(),
      constraint: z.optional(z.number()),
      span: spanSchema,
    }),
  }),
  z.object({
    And: z.object({
      span: spanSchema,
    }),
  }),
])

const operatorSchema = z.object({
  operator: rangeCtlOpSchema,
  type2: type2Schema,
  comments_before_operator: z.optional(commentsSchema),
  comments_after_operator: z.optional(commentsSchema),
})

const typeRuleSchema = z.object({
  name: identifierSchema,
  generic_params: z.optional(genericParamsSchema),
  is_type_choice_alternate: z.boolean(),
  value: typeSchema,
  comments_before_assignt: z.optional(commentsSchema),
  comments_after_assignt: z.optional(commentsSchema),
})

const groupRuleSchema = z.object({
  name: identifierSchema,
  generic_params: z.optional(genericParamsSchema),
  is_type_choice_alternate: z.boolean(),
  entry: groupEntrySchema,
  comments_before_assigng: z.optional(commentsSchema),
  comments_after_assigng: z.optional(commentsSchema),
})

const ruleSchema = z.union([
  z.object({
    Type: z.object({
      rule: typeRuleSchema,
      span: spanSchema,
      comments_after_rule: z.optional(commentsSchema),
    }),
  }),
  z.object({
    Group: z.object({
      rule: groupRuleSchema,
      span: spanSchema,
      comments_after_rule: z.optional(commentsSchema),
    }),
  }),
])

export const cddlSchema = z.object({
  rules: z.array(ruleSchema),
  // We don't need comments here
  // comments
  // comments: z.optional(Comments)
})

export type CDDL = z.infer<typeof cddlSchema>

export type Rule = z.infer<typeof ruleSchema>
