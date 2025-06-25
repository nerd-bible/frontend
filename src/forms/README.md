# Zod + Solid JS Forms

This package generates a full fledged form from just a Zod schema. It provides
sensible defaults for controls and layout, but you may use the provided Zod
registry to customize every part of your form.

Popover errors use [@floating-ui/dom](https://floating-ui.com/docs/tutorial),
which you may also customize.

## Registry
```ts
type FormControl = {
    component: JSX.Element<{ validate?: ( v: string | number | string[] | undefined) => string[] | undefined;}>;
    validateOn: string;
};
```

### Usage
```ts
const mySchema = z.object({
    name: z.string().register(registry, { label: "Full name" }),
    age: z.number(),
});

function MyComponent() {
    const [Form, data, setData] = createForm(mySchema);
    return <Form onSubmit={ev => {
        ev.preventDefault();
        console.log(data);
    }} />
}

```
