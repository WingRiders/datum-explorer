export type CDDL = {
  rules: Rule[]
  // We don't need comments here
  // comments?: Comments
}

export type Comments = string[]

export type GenericArg = {
  arg: Type1
  comments_before_type?: Comments
  comments_after_type?: Comments
}

export type GenericArgs = {
  args: GenericArg[]
  span: Span
}

export type GenericParam = {
  param: Identifier
  comments_before_ident?: Comments
  comments_after_ident?: Comments
}

export type GenericParams = {
  params: GenericParam[]
  span: Span
}

export type Group = {
  group_choices: GroupChoice[]
  span: Span
}

export type OptionalComma = {
  optional_comma: boolean
  trailing_comments?: Comments
}

export type GroupChoice = {
  group_entries: [GroupEntry, OptionalComma][]
  comments?: string[]
}

export type GroupEntry =
  | {
      ValueMemberKey: {
        ge: ValueMemberKeyEntry
        span: Span
        leading_comments?: Comments
        trailing_comments?: Comments
      }
    }
  | {
      TypeGroupname: {
        ge: TypeGroupnameEntry
        span: Span
        leading_comments?: Comments
        trailing_comments?: Comments
      }
    }
  | {
      InlineGroup: {
        occur?: Occurrence
        group: Group
        span: Span
        comments_before_group?: Comments
        comments_after_group?: Comments
      }
    }

export type GroupRule = {
  name: Identifier
  generic_params?: GenericParams
  is_type_choice_alternate: boolean
  entry: GroupEntry
  comments_before_assigng?: Comments
  comments_after_assigng?: Comments
}

// We don't support socket / plug https://www.rfc-editor.org/rfc/rfc8610.html#section-3.9
export type Identifier = {
  ident: string
  span: Span
}

export type MemberKey =
  | {
      Type1: {
        t1: Type1
        is_cut: boolean
        span: Span
        comments_before_cut?: Comments
        comments_after_cut?: Comments
        comments_after_arrowmap?: Comments
      }
    }
  | {
      Bareword: {
        ident: Identifier
        span: Span
        comments?: Comments
        comments_after_colon?: Comments
      }
    }
  | {
      Value: {
        value: Value
        span: Span
        comments?: Comments
        comments_after_colon?: Comments
      }
    }
  | {
      NonMemberKey: {
        // TODO Do we need this?
        // non_member_key: NonMemberKey
        comments_before_type_or_group?: Comments
        comments_after_type_or_group?: Comments
      }
    }

export type Occurrence = {
  occur: Occur
  comments?: Comments
}

export type Occur = {
  Exact: {
    lower?: number
    upper?: number
    span: Span
  }
  ZeroOrMore: {
    // *
    span: Span
  }
  OneOrMore: {
    // +
    span: Span
  }
  Optional: {
    // ?
    span: Span
  }
}

export type Operator = {
  operator: RangeCtlOp
  type2: Type2
  comments_before_operator?: Comments
  comments_after_operator?: Comments
}

export type RangeCtlOp =
  | {
      RangeOp: {
        is_inclusive: boolean
        span: Span
      }
    }
  | {
      CtlOp: {
        // TODO Do we need this?
        // ctrl: ControlOperator
        span: Span
      }
    }

export type Rule =
  | {
      Type: {rule: TypeRule; span: Span; comments_after_rule?: Comments}
    }
  | {
      Group: {rule: GroupRule; span: Span; comments_after_rule?: Comments}
    }

export type Span = [number, number, number]

export type TypeGroupnameEntry = {
  occur?: Occurrence
  name: Identifier
  generic_args?: GenericArgs
}

export type Type = {
  type_choices: TypeChoice[]
  span: Span
}

export type TypeChoice = {
  type1: Type1
  comments_before_type?: Comments
  comments_after_type?: Comments
}

export type Type1 = {
  type2: Type2
  operator?: Operator
  span: Span
  comments_after_type?: Comments
}

export type Type2 =
  | {
      IntValue: {
        value: number
        span: Span
      }
    }
  | {
      UintValue: {
        value: number
        span: Span
      }
    }
  | {
      FloatValue: {
        value: number
        span: Span
      }
    }
  | {
      TextValue: {
        value: string
        span: Span
      }
    }
  | {
      UTF8ByteString: {
        value: Buffer
        span: Span
      }
    }
  | {
      B16ByteString: {
        value: Buffer
        span: Span
      }
    }
  | {
      Typename: {
        ident: Identifier
        generic_args?: GenericArgs
        span: Span
      }
    }
  | {
      ParenthesizedType: {
        pt: Type
        span: Span
        comments_before_type?: Comments
        comments_after_type?: Comments
      }
    }
  | {
      Map: {
        group: Group
        span: Span
        comments_before_group?: Comments
        comments_after_group?: Comments
      }
    }
  | {
      Array: {
        group: Group
        span: Span
        comments_before_group?: Comments
        comments_after_group?: Comments
      }
    }
  | {
      Unwrap: {
        ident: Identifier
        generic_args?: GenericArgs
        span: Span
        comments?: Comments
      }
    }
  | {
      ChoiceFromInlineGroup: {
        group: Group
        span: Span
        comments?: Comments
        comments_before_group?: Comments
        comments_after_group?: Comments
      }
    }
  | {
      ChoiceFromGroup: {
        ident: Identifier
        generic_args?: GenericArgs
        span: Span
        comments?: Comments
      }
    }
  | {
      TaggedData: {
        tag?: number
        t: Type
        span: Span
        comments_before_type?: Comments
        comments_after_type?: Comments
      }
    }
  | {
      DataMajorType: {
        mt: number
        constraint?: number
        span: Span
      }
    }
  | {
      And: {
        span: Span
      }
    }

export type TypeRule = {
  name: Identifier
  generic_params?: GenericParams
  is_type_choice_alternate: boolean
  value: Type
  comments_before_assignt?: Comments
  comments_after_assignt?: Comments
}

export type Value = number | string | Buffer

export type ValueMemberKeyEntry = {
  occur?: Occurrence
  member_key?: MemberKey
  entry_type: Type
}
