type PathType = {
    path: string
    name: string
    children?: PathType[]
    render?: (prevPath: string) => string
}

const paths: PathType[] = [
    {
        path: "security-server",
        name: "security",
        children: [
            {
                path: "auth",
                name: "auth",
                children: [
                    {
                        path: "bot",
                        name: "authAsBot",
                        render: (prevPath) => {
                            return `${ prevPath }botASDZXCASDASD`;
                        }
                    },
                    {
                        path: "user",
                        name: "authAsUser"
                    }
                ]
            },
            {
                path: "jwt",
                name: "jwt"
            }
        ]
    },
    {
        path: "migration-server",
        name: "migration"
    }
];

class PathNode {
    path: string;
    name: string;
    childrenNodes: PathNode[];
    parentNode: PathNode | null;
    render?: (prevPath: string) => string;

    constructor(name: string, path: string, render?: (prevPath: string) => string) {
        this.path = path;
        this.name = name;
        this.childrenNodes = new Array<PathNode>();
        this.parentNode = null;
        this.render = render;
    }

    setParent(node: PathNode | null) {
        this.parentNode = node;
    }

    addChild(node: PathNode) {
        this.childrenNodes.push(node);
    }

}

class PathTree {
    allNodes: PathNode[] = [];

    addNode(nodeName: string, path: string, render?: (prevPath: string) => string): PathNode {
        let node = this.getTableNodeByName(nodeName);
        if (!node) {
            node = new PathNode(nodeName, path, render);
            this.allNodes.push(node);
        }
        return node;
    }

    getParents(): PathNode[] {
        return this.allNodes.filter(node => node.parentNode === null);
    }

    private getTableNodeByName = (nodeName: string): PathNode | undefined => {
        return this.allNodes.find(value => value.name === nodeName);
    };

}

const createPath = (initValues: PathType[]) => {

    const tree = new PathTree();

    initValues.forEach(value => {
        reverseCreateNode(value, tree, null);
    });

    const parents = tree.getParents();
    let result: any = {};

    parents.forEach(v => {
        reverseCreateFunctions(v, result);
    });
    console.log(result)
    return result;
};

const reverseCreateNode = (value: PathType, tree: PathTree, parent: PathNode | null) => {
    const node = tree.addNode(value.name, value.path, value.render);
    node.setParent(parent);
    value.children?.forEach(ch => {
        const newNode = tree.addNode(ch.name, ch.path, ch.render);
        node.addChild(newNode);
        reverseCreateNode(ch, tree, node);
    });
};

const reverseCreateFunctions = (node: PathNode, result: any) => {
    result[node.name] = (url?: string): string => {
        const result = { a: "" };
        const customPath: string | undefined = reverseCreatePath(node, result);
        if (customPath) {
            return url ? customPath + url : customPath;
        }
        return url ? result.a + url : result.a;
    };
    node.childrenNodes.forEach(ch => {
        reverseCreateFunctions(ch, result);
    });
};

const reverseCreatePath = (node: PathNode, result: { a: string }): string | undefined => {
    if (node.parentNode) {
        reverseCreatePath(node.parentNode, result);
    }
    if (node.render) {
        return node.render(result.a);
    } else {
        result.a += node.path + "/";
    }
};

console.log(
    createPath(paths)
    .authAsBot()
);