/**
 * Generic interface for transforming data from one type to another.
 *
 * @template TypeInput - The input type to transform.
 * @template TypeOutput - The output type after transformation.
 */
export interface TransformerInterface<TypeInput, TypeOutput>
{
	/**
	 * Transforms the input data to the output data.
	 *
	 * @param {TypeInput} input - The input data to transform.
	 * @returns {TypeOutput} - The output data after transformation.
	 */
	transform(input: TypeInput | undefined): TypeOutput | undefined;
}
