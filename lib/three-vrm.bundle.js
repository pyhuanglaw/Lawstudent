var THREE_VRM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // entry.ts
  var entry_exports = {};
  __export(entry_exports, {
    MToonMaterial: () => MToonMaterial,
    MToonMaterialDebugMode: () => MToonMaterialDebugMode,
    MToonMaterialLoaderPlugin: () => MToonMaterialLoaderPlugin,
    MToonMaterialOutlineWidthMode: () => MToonMaterialOutlineWidthMode,
    VRM: () => VRM,
    VRMAimConstraint: () => VRMAimConstraint,
    VRMCore: () => VRMCore,
    VRMCoreLoaderPlugin: () => VRMCoreLoaderPlugin,
    VRMExpression: () => VRMExpression,
    VRMExpressionLoaderPlugin: () => VRMExpressionLoaderPlugin,
    VRMExpressionManager: () => VRMExpressionManager,
    VRMExpressionMaterialColorBind: () => VRMExpressionMaterialColorBind,
    VRMExpressionMaterialColorType: () => VRMExpressionMaterialColorType,
    VRMExpressionMorphTargetBind: () => VRMExpressionMorphTargetBind,
    VRMExpressionOverrideType: () => VRMExpressionOverrideType,
    VRMExpressionPresetName: () => VRMExpressionPresetName,
    VRMExpressionTextureTransformBind: () => VRMExpressionTextureTransformBind,
    VRMFirstPerson: () => VRMFirstPerson,
    VRMFirstPersonLoaderPlugin: () => VRMFirstPersonLoaderPlugin,
    VRMFirstPersonMeshAnnotationType: () => VRMFirstPersonMeshAnnotationType,
    VRMHumanBoneList: () => VRMHumanBoneList,
    VRMHumanBoneName: () => VRMHumanBoneName,
    VRMHumanBoneParentMap: () => VRMHumanBoneParentMap,
    VRMHumanoid: () => VRMHumanoid,
    VRMHumanoidHelper: () => VRMHumanoidHelper,
    VRMHumanoidLoaderPlugin: () => VRMHumanoidLoaderPlugin,
    VRMLoaderPlugin: () => VRMLoaderPlugin,
    VRMLookAt: () => VRMLookAt,
    VRMLookAtBoneApplier: () => VRMLookAtBoneApplier,
    VRMLookAtExpressionApplier: () => VRMLookAtExpressionApplier,
    VRMLookAtHelper: () => VRMLookAtHelper,
    VRMLookAtLoaderPlugin: () => VRMLookAtLoaderPlugin,
    VRMLookAtRangeMap: () => VRMLookAtRangeMap,
    VRMLookAtTypeName: () => VRMLookAtTypeName,
    VRMMetaLoaderPlugin: () => VRMMetaLoaderPlugin,
    VRMNodeConstraint: () => VRMNodeConstraint,
    VRMNodeConstraintHelper: () => VRMNodeConstraintHelper,
    VRMNodeConstraintLoaderPlugin: () => VRMNodeConstraintLoaderPlugin,
    VRMNodeConstraintManager: () => VRMNodeConstraintManager,
    VRMRequiredHumanBoneName: () => VRMRequiredHumanBoneName,
    VRMRollConstraint: () => VRMRollConstraint,
    VRMRotationConstraint: () => VRMRotationConstraint,
    VRMSpringBoneCollider: () => VRMSpringBoneCollider,
    VRMSpringBoneColliderHelper: () => VRMSpringBoneColliderHelper,
    VRMSpringBoneColliderShape: () => VRMSpringBoneColliderShape,
    VRMSpringBoneColliderShapeCapsule: () => VRMSpringBoneColliderShapeCapsule,
    VRMSpringBoneColliderShapePlane: () => VRMSpringBoneColliderShapePlane,
    VRMSpringBoneColliderShapeSphere: () => VRMSpringBoneColliderShapeSphere,
    VRMSpringBoneJoint: () => VRMSpringBoneJoint,
    VRMSpringBoneJointHelper: () => VRMSpringBoneJointHelper,
    VRMSpringBoneLoaderPlugin: () => VRMSpringBoneLoaderPlugin,
    VRMSpringBoneManager: () => VRMSpringBoneManager,
    VRMUtils: () => VRMUtils
  });

  // three-shim.js
  var T = window.THREE;
  var ACESFilmicToneMapping = T.ACESFilmicToneMapping;
  var AddEquation = T.AddEquation;
  var AddOperation = T.AddOperation;
  var AdditiveAnimationBlendMode = T.AdditiveAnimationBlendMode;
  var AdditiveBlending = T.AdditiveBlending;
  var AgXToneMapping = T.AgXToneMapping;
  var AlphaFormat = T.AlphaFormat;
  var AlwaysCompare = T.AlwaysCompare;
  var AlwaysDepth = T.AlwaysDepth;
  var AlwaysStencilFunc = T.AlwaysStencilFunc;
  var AmbientLight = T.AmbientLight;
  var AnimationAction = T.AnimationAction;
  var AnimationClip = T.AnimationClip;
  var AnimationLoader = T.AnimationLoader;
  var AnimationMixer = T.AnimationMixer;
  var AnimationObjectGroup = T.AnimationObjectGroup;
  var AnimationUtils = T.AnimationUtils;
  var ArcCurve = T.ArcCurve;
  var ArrayCamera = T.ArrayCamera;
  var ArrowHelper = T.ArrowHelper;
  var AttachedBindMode = T.AttachedBindMode;
  var Audio = T.Audio;
  var AudioAnalyser = T.AudioAnalyser;
  var AudioContext = T.AudioContext;
  var AudioListener = T.AudioListener;
  var AudioLoader = T.AudioLoader;
  var AxesHelper = T.AxesHelper;
  var BackSide = T.BackSide;
  var BasicDepthPacking = T.BasicDepthPacking;
  var BasicShadowMap = T.BasicShadowMap;
  var BatchedMesh = T.BatchedMesh;
  var BezierInterpolant = T.BezierInterpolant;
  var Bone = T.Bone;
  var BooleanKeyframeTrack = T.BooleanKeyframeTrack;
  var Box2 = T.Box2;
  var Box3 = T.Box3;
  var Box3Helper = T.Box3Helper;
  var BoxGeometry = T.BoxGeometry;
  var BoxHelper = T.BoxHelper;
  var BufferAttribute = T.BufferAttribute;
  var BufferGeometry = T.BufferGeometry;
  var BufferGeometryLoader = T.BufferGeometryLoader;
  var ByteType = T.ByteType;
  var Cache = T.Cache;
  var Camera = T.Camera;
  var CameraHelper = T.CameraHelper;
  var CanvasTexture = T.CanvasTexture;
  var CapsuleGeometry = T.CapsuleGeometry;
  var CatmullRomCurve3 = T.CatmullRomCurve3;
  var CineonToneMapping = T.CineonToneMapping;
  var CircleGeometry = T.CircleGeometry;
  var ClampToEdgeWrapping = T.ClampToEdgeWrapping;
  var Clock = T.Clock;
  var Color = T.Color;
  var ColorKeyframeTrack = T.ColorKeyframeTrack;
  var ColorManagement = T.ColorManagement;
  var Compatibility = T.Compatibility;
  var CompressedArrayTexture = T.CompressedArrayTexture;
  var CompressedCubeTexture = T.CompressedCubeTexture;
  var CompressedTexture = T.CompressedTexture;
  var CompressedTextureLoader = T.CompressedTextureLoader;
  var ConeGeometry = T.ConeGeometry;
  var ConstantAlphaFactor = T.ConstantAlphaFactor;
  var ConstantColorFactor = T.ConstantColorFactor;
  var Controls = T.Controls;
  var CubeCamera = T.CubeCamera;
  var CubeDepthTexture = T.CubeDepthTexture;
  var CubeReflectionMapping = T.CubeReflectionMapping;
  var CubeRefractionMapping = T.CubeRefractionMapping;
  var CubeTexture = T.CubeTexture;
  var CubeTextureLoader = T.CubeTextureLoader;
  var CubicBezierCurve = T.CubicBezierCurve;
  var CubicBezierCurve3 = T.CubicBezierCurve3;
  var CubicInterpolant = T.CubicInterpolant;
  var CullFaceBack = T.CullFaceBack;
  var CullFaceFront = T.CullFaceFront;
  var CullFaceFrontBack = T.CullFaceFrontBack;
  var CullFaceNone = T.CullFaceNone;
  var Curve = T.Curve;
  var CurvePath = T.CurvePath;
  var CustomBlending = T.CustomBlending;
  var CustomToneMapping = T.CustomToneMapping;
  var CylinderGeometry = T.CylinderGeometry;
  var Cylindrical = T.Cylindrical;
  var Data3DTexture = T.Data3DTexture;
  var DataArrayTexture = T.DataArrayTexture;
  var DataTexture = T.DataTexture;
  var DataTextureLoader = T.DataTextureLoader;
  var DataUtils = T.DataUtils;
  var DecrementStencilOp = T.DecrementStencilOp;
  var DecrementWrapStencilOp = T.DecrementWrapStencilOp;
  var DefaultLoadingManager = T.DefaultLoadingManager;
  var DepthFormat = T.DepthFormat;
  var DepthStencilFormat = T.DepthStencilFormat;
  var DepthTexture = T.DepthTexture;
  var DetachedBindMode = T.DetachedBindMode;
  var DirectionalLight = T.DirectionalLight;
  var DirectionalLightHelper = T.DirectionalLightHelper;
  var DiscreteInterpolant = T.DiscreteInterpolant;
  var DodecahedronGeometry = T.DodecahedronGeometry;
  var DoubleSide = T.DoubleSide;
  var DstAlphaFactor = T.DstAlphaFactor;
  var DstColorFactor = T.DstColorFactor;
  var DynamicCopyUsage = T.DynamicCopyUsage;
  var DynamicDrawUsage = T.DynamicDrawUsage;
  var DynamicReadUsage = T.DynamicReadUsage;
  var EdgesGeometry = T.EdgesGeometry;
  var EllipseCurve = T.EllipseCurve;
  var EqualCompare = T.EqualCompare;
  var EqualDepth = T.EqualDepth;
  var EqualStencilFunc = T.EqualStencilFunc;
  var EquirectangularReflectionMapping = T.EquirectangularReflectionMapping;
  var EquirectangularRefractionMapping = T.EquirectangularRefractionMapping;
  var Euler = T.Euler;
  var EventDispatcher = T.EventDispatcher;
  var ExternalTexture = T.ExternalTexture;
  var ExtrudeGeometry = T.ExtrudeGeometry;
  var FileLoader = T.FileLoader;
  var Float16BufferAttribute = T.Float16BufferAttribute;
  var Float32BufferAttribute = T.Float32BufferAttribute;
  var FloatType = T.FloatType;
  var Fog = T.Fog;
  var FogExp2 = T.FogExp2;
  var FramebufferTexture = T.FramebufferTexture;
  var FrontSide = T.FrontSide;
  var Frustum = T.Frustum;
  var FrustumArray = T.FrustumArray;
  var GLBufferAttribute = T.GLBufferAttribute;
  var GLSL1 = T.GLSL1;
  var GLSL3 = T.GLSL3;
  var GreaterCompare = T.GreaterCompare;
  var GreaterDepth = T.GreaterDepth;
  var GreaterEqualCompare = T.GreaterEqualCompare;
  var GreaterEqualDepth = T.GreaterEqualDepth;
  var GreaterEqualStencilFunc = T.GreaterEqualStencilFunc;
  var GreaterStencilFunc = T.GreaterStencilFunc;
  var GridHelper = T.GridHelper;
  var Group = T.Group;
  var HTMLTexture = T.HTMLTexture;
  var HalfFloatType = T.HalfFloatType;
  var HemisphereLight = T.HemisphereLight;
  var HemisphereLightHelper = T.HemisphereLightHelper;
  var IcosahedronGeometry = T.IcosahedronGeometry;
  var ImageBitmapLoader = T.ImageBitmapLoader;
  var ImageLoader = T.ImageLoader;
  var ImageUtils = T.ImageUtils;
  var IncrementStencilOp = T.IncrementStencilOp;
  var IncrementWrapStencilOp = T.IncrementWrapStencilOp;
  var InstancedBufferAttribute = T.InstancedBufferAttribute;
  var InstancedBufferGeometry = T.InstancedBufferGeometry;
  var InstancedInterleavedBuffer = T.InstancedInterleavedBuffer;
  var InstancedMesh = T.InstancedMesh;
  var Int16BufferAttribute = T.Int16BufferAttribute;
  var Int32BufferAttribute = T.Int32BufferAttribute;
  var Int8BufferAttribute = T.Int8BufferAttribute;
  var IntType = T.IntType;
  var InterleavedBuffer = T.InterleavedBuffer;
  var InterleavedBufferAttribute = T.InterleavedBufferAttribute;
  var Interpolant = T.Interpolant;
  var InterpolateBezier = T.InterpolateBezier;
  var InterpolateDiscrete = T.InterpolateDiscrete;
  var InterpolateLinear = T.InterpolateLinear;
  var InterpolateSmooth = T.InterpolateSmooth;
  var InterpolationSamplingMode = T.InterpolationSamplingMode;
  var InterpolationSamplingType = T.InterpolationSamplingType;
  var InvertStencilOp = T.InvertStencilOp;
  var KeepStencilOp = T.KeepStencilOp;
  var KeyframeTrack = T.KeyframeTrack;
  var LOD = T.LOD;
  var LatheGeometry = T.LatheGeometry;
  var Layers = T.Layers;
  var LessCompare = T.LessCompare;
  var LessDepth = T.LessDepth;
  var LessEqualCompare = T.LessEqualCompare;
  var LessEqualDepth = T.LessEqualDepth;
  var LessEqualStencilFunc = T.LessEqualStencilFunc;
  var LessStencilFunc = T.LessStencilFunc;
  var Light = T.Light;
  var LightProbe = T.LightProbe;
  var LightShadow = T.LightShadow;
  var Line = T.Line;
  var Line3 = T.Line3;
  var LineBasicMaterial = T.LineBasicMaterial;
  var LineCurve = T.LineCurve;
  var LineCurve3 = T.LineCurve3;
  var LineDashedMaterial = T.LineDashedMaterial;
  var LineLoop = T.LineLoop;
  var LineSegments = T.LineSegments;
  var LinearFilter = T.LinearFilter;
  var LinearInterpolant = T.LinearInterpolant;
  var LinearMipMapLinearFilter = T.LinearMipMapLinearFilter;
  var LinearMipMapNearestFilter = T.LinearMipMapNearestFilter;
  var LinearMipmapLinearFilter = T.LinearMipmapLinearFilter;
  var LinearMipmapNearestFilter = T.LinearMipmapNearestFilter;
  var LinearSRGBColorSpace = T.LinearSRGBColorSpace;
  var LinearToneMapping = T.LinearToneMapping;
  var LinearTransfer = T.LinearTransfer;
  var Loader = T.Loader;
  var LoaderUtils = T.LoaderUtils;
  var LoadingManager = T.LoadingManager;
  var LoopOnce = T.LoopOnce;
  var LoopPingPong = T.LoopPingPong;
  var LoopRepeat = T.LoopRepeat;
  var MOUSE = T.MOUSE;
  var Material = T.Material;
  var MaterialBlending = T.MaterialBlending;
  var MaterialLoader = T.MaterialLoader;
  var MathUtils = T.MathUtils;
  var Matrix2 = T.Matrix2;
  var Matrix3 = T.Matrix3;
  var Matrix4 = T.Matrix4;
  var MaxEquation = T.MaxEquation;
  var Mesh = T.Mesh;
  var MeshBasicMaterial = T.MeshBasicMaterial;
  var MeshDepthMaterial = T.MeshDepthMaterial;
  var MeshDistanceMaterial = T.MeshDistanceMaterial;
  var MeshLambertMaterial = T.MeshLambertMaterial;
  var MeshMatcapMaterial = T.MeshMatcapMaterial;
  var MeshNormalMaterial = T.MeshNormalMaterial;
  var MeshPhongMaterial = T.MeshPhongMaterial;
  var MeshPhysicalMaterial = T.MeshPhysicalMaterial;
  var MeshStandardMaterial = T.MeshStandardMaterial;
  var MeshToonMaterial = T.MeshToonMaterial;
  var MinEquation = T.MinEquation;
  var MirroredRepeatWrapping = T.MirroredRepeatWrapping;
  var MixOperation = T.MixOperation;
  var MultiplyBlending = T.MultiplyBlending;
  var MultiplyOperation = T.MultiplyOperation;
  var NearestFilter = T.NearestFilter;
  var NearestMipMapLinearFilter = T.NearestMipMapLinearFilter;
  var NearestMipMapNearestFilter = T.NearestMipMapNearestFilter;
  var NearestMipmapLinearFilter = T.NearestMipmapLinearFilter;
  var NearestMipmapNearestFilter = T.NearestMipmapNearestFilter;
  var NeutralToneMapping = T.NeutralToneMapping;
  var NeverCompare = T.NeverCompare;
  var NeverDepth = T.NeverDepth;
  var NeverStencilFunc = T.NeverStencilFunc;
  var NoBlending = T.NoBlending;
  var NoColorSpace = T.NoColorSpace;
  var NoNormalPacking = T.NoNormalPacking;
  var NoToneMapping = T.NoToneMapping;
  var NormalAnimationBlendMode = T.NormalAnimationBlendMode;
  var NormalBlending = T.NormalBlending;
  var NormalGAPacking = T.NormalGAPacking;
  var NormalRGPacking = T.NormalRGPacking;
  var NotEqualCompare = T.NotEqualCompare;
  var NotEqualDepth = T.NotEqualDepth;
  var NotEqualStencilFunc = T.NotEqualStencilFunc;
  var NumberKeyframeTrack = T.NumberKeyframeTrack;
  var Object3D = T.Object3D;
  var ObjectLoader = T.ObjectLoader;
  var ObjectSpaceNormalMap = T.ObjectSpaceNormalMap;
  var OctahedronGeometry = T.OctahedronGeometry;
  var OneFactor = T.OneFactor;
  var OneMinusConstantAlphaFactor = T.OneMinusConstantAlphaFactor;
  var OneMinusConstantColorFactor = T.OneMinusConstantColorFactor;
  var OneMinusDstAlphaFactor = T.OneMinusDstAlphaFactor;
  var OneMinusDstColorFactor = T.OneMinusDstColorFactor;
  var OneMinusSrcAlphaFactor = T.OneMinusSrcAlphaFactor;
  var OneMinusSrcColorFactor = T.OneMinusSrcColorFactor;
  var OrthographicCamera = T.OrthographicCamera;
  var PCFShadowMap = T.PCFShadowMap;
  var PCFSoftShadowMap = T.PCFSoftShadowMap;
  var Path = T.Path;
  var PerspectiveCamera = T.PerspectiveCamera;
  var Plane = T.Plane;
  var PlaneGeometry = T.PlaneGeometry;
  var PlaneHelper = T.PlaneHelper;
  var PointLight = T.PointLight;
  var PointLightHelper = T.PointLightHelper;
  var Points = T.Points;
  var PointsMaterial = T.PointsMaterial;
  var PolarGridHelper = T.PolarGridHelper;
  var PolyhedronGeometry = T.PolyhedronGeometry;
  var PositionalAudio = T.PositionalAudio;
  var PropertyBinding = T.PropertyBinding;
  var PropertyMixer = T.PropertyMixer;
  var QuadraticBezierCurve = T.QuadraticBezierCurve;
  var QuadraticBezierCurve3 = T.QuadraticBezierCurve3;
  var Quaternion = T.Quaternion;
  var QuaternionKeyframeTrack = T.QuaternionKeyframeTrack;
  var QuaternionLinearInterpolant = T.QuaternionLinearInterpolant;
  var R11_EAC_Format = T.R11_EAC_Format;
  var RAD2DEG = T.RAD2DEG;
  var RED_GREEN_RGTC2_Format = T.RED_GREEN_RGTC2_Format;
  var RED_RGTC1_Format = T.RED_RGTC1_Format;
  var REVISION = T.REVISION;
  var RG11_EAC_Format = T.RG11_EAC_Format;
  var RGBADepthPacking = T.RGBADepthPacking;
  var RGBAFormat = T.RGBAFormat;
  var RGBAIntegerFormat = T.RGBAIntegerFormat;
  var RGBA_ASTC_10x10_Format = T.RGBA_ASTC_10x10_Format;
  var RGBA_ASTC_10x5_Format = T.RGBA_ASTC_10x5_Format;
  var RGBA_ASTC_10x6_Format = T.RGBA_ASTC_10x6_Format;
  var RGBA_ASTC_10x8_Format = T.RGBA_ASTC_10x8_Format;
  var RGBA_ASTC_12x10_Format = T.RGBA_ASTC_12x10_Format;
  var RGBA_ASTC_12x12_Format = T.RGBA_ASTC_12x12_Format;
  var RGBA_ASTC_4x4_Format = T.RGBA_ASTC_4x4_Format;
  var RGBA_ASTC_5x4_Format = T.RGBA_ASTC_5x4_Format;
  var RGBA_ASTC_5x5_Format = T.RGBA_ASTC_5x5_Format;
  var RGBA_ASTC_6x5_Format = T.RGBA_ASTC_6x5_Format;
  var RGBA_ASTC_6x6_Format = T.RGBA_ASTC_6x6_Format;
  var RGBA_ASTC_8x5_Format = T.RGBA_ASTC_8x5_Format;
  var RGBA_ASTC_8x6_Format = T.RGBA_ASTC_8x6_Format;
  var RGBA_ASTC_8x8_Format = T.RGBA_ASTC_8x8_Format;
  var RGBA_BPTC_Format = T.RGBA_BPTC_Format;
  var RGBA_ETC2_EAC_Format = T.RGBA_ETC2_EAC_Format;
  var RGBA_PVRTC_2BPPV1_Format = T.RGBA_PVRTC_2BPPV1_Format;
  var RGBA_PVRTC_4BPPV1_Format = T.RGBA_PVRTC_4BPPV1_Format;
  var RGBA_S3TC_DXT1_Format = T.RGBA_S3TC_DXT1_Format;
  var RGBA_S3TC_DXT3_Format = T.RGBA_S3TC_DXT3_Format;
  var RGBA_S3TC_DXT5_Format = T.RGBA_S3TC_DXT5_Format;
  var RGBDepthPacking = T.RGBDepthPacking;
  var RGBFormat = T.RGBFormat;
  var RGBIntegerFormat = T.RGBIntegerFormat;
  var RGB_BPTC_SIGNED_Format = T.RGB_BPTC_SIGNED_Format;
  var RGB_BPTC_UNSIGNED_Format = T.RGB_BPTC_UNSIGNED_Format;
  var RGB_ETC1_Format = T.RGB_ETC1_Format;
  var RGB_ETC2_Format = T.RGB_ETC2_Format;
  var RGB_PVRTC_2BPPV1_Format = T.RGB_PVRTC_2BPPV1_Format;
  var RGB_PVRTC_4BPPV1_Format = T.RGB_PVRTC_4BPPV1_Format;
  var RGB_S3TC_DXT1_Format = T.RGB_S3TC_DXT1_Format;
  var RGDepthPacking = T.RGDepthPacking;
  var RGFormat = T.RGFormat;
  var RGIntegerFormat = T.RGIntegerFormat;
  var RawShaderMaterial = T.RawShaderMaterial;
  var Ray = T.Ray;
  var Raycaster = T.Raycaster;
  var RectAreaLight = T.RectAreaLight;
  var RedFormat = T.RedFormat;
  var RedIntegerFormat = T.RedIntegerFormat;
  var ReinhardToneMapping = T.ReinhardToneMapping;
  var RenderObjectRefreshType = T.RenderObjectRefreshType;
  var RenderTarget = T.RenderTarget;
  var RenderTarget3D = T.RenderTarget3D;
  var RepeatWrapping = T.RepeatWrapping;
  var ReplaceStencilOp = T.ReplaceStencilOp;
  var ReverseSubtractEquation = T.ReverseSubtractEquation;
  var ReversedDepthFuncs = T.ReversedDepthFuncs;
  var RingGeometry = T.RingGeometry;
  var SIGNED_R11_EAC_Format = T.SIGNED_R11_EAC_Format;
  var SIGNED_RED_GREEN_RGTC2_Format = T.SIGNED_RED_GREEN_RGTC2_Format;
  var SIGNED_RED_RGTC1_Format = T.SIGNED_RED_RGTC1_Format;
  var SIGNED_RG11_EAC_Format = T.SIGNED_RG11_EAC_Format;
  var SRGBColorSpace = T.SRGBColorSpace;
  var SRGBTransfer = T.SRGBTransfer;
  var Scene = T.Scene;
  var ShaderMaterial = T.ShaderMaterial;
  var ShadowMaterial = T.ShadowMaterial;
  var Shape = T.Shape;
  var ShapeGeometry = T.ShapeGeometry;
  var ShapePath = T.ShapePath;
  var ShapeUtils = T.ShapeUtils;
  var ShortType = T.ShortType;
  var Skeleton = T.Skeleton;
  var SkeletonHelper = T.SkeletonHelper;
  var SkinnedMesh = T.SkinnedMesh;
  var Source = T.Source;
  var Sphere = T.Sphere;
  var SphereGeometry = T.SphereGeometry;
  var Spherical = T.Spherical;
  var SphericalHarmonics3 = T.SphericalHarmonics3;
  var SplineCurve = T.SplineCurve;
  var SpotLight = T.SpotLight;
  var SpotLightHelper = T.SpotLightHelper;
  var Sprite = T.Sprite;
  var SpriteMaterial = T.SpriteMaterial;
  var SrcAlphaFactor = T.SrcAlphaFactor;
  var SrcAlphaSaturateFactor = T.SrcAlphaSaturateFactor;
  var SrcColorFactor = T.SrcColorFactor;
  var StaticCopyUsage = T.StaticCopyUsage;
  var StaticDrawUsage = T.StaticDrawUsage;
  var StaticReadUsage = T.StaticReadUsage;
  var StereoCamera = T.StereoCamera;
  var StreamCopyUsage = T.StreamCopyUsage;
  var StreamDrawUsage = T.StreamDrawUsage;
  var StreamReadUsage = T.StreamReadUsage;
  var StringKeyframeTrack = T.StringKeyframeTrack;
  var SubtractEquation = T.SubtractEquation;
  var SubtractiveBlending = T.SubtractiveBlending;
  var TOUCH = T.TOUCH;
  var TangentSpaceNormalMap = T.TangentSpaceNormalMap;
  var TetrahedronGeometry = T.TetrahedronGeometry;
  var Texture = T.Texture;
  var TextureLoader = T.TextureLoader;
  var TextureSource = T.TextureSource;
  var TextureUtils = T.TextureUtils;
  var Timer = T.Timer;
  var TimestampQuery = T.TimestampQuery;
  var TorusGeometry = T.TorusGeometry;
  var TorusKnotGeometry = T.TorusKnotGeometry;
  var Triangle = T.Triangle;
  var TriangleFanDrawMode = T.TriangleFanDrawMode;
  var TriangleStripDrawMode = T.TriangleStripDrawMode;
  var TrianglesDrawMode = T.TrianglesDrawMode;
  var TubeGeometry = T.TubeGeometry;
  var UVMapping = T.UVMapping;
  var Uint16BufferAttribute = T.Uint16BufferAttribute;
  var Uint32BufferAttribute = T.Uint32BufferAttribute;
  var Uint8BufferAttribute = T.Uint8BufferAttribute;
  var Uint8ClampedBufferAttribute = T.Uint8ClampedBufferAttribute;
  var Uniform = T.Uniform;
  var UniformsGroup = T.UniformsGroup;
  var UniformsUtils = T.UniformsUtils;
  var UnsignedByteType = T.UnsignedByteType;
  var UnsignedInt101111Type = T.UnsignedInt101111Type;
  var UnsignedInt248Type = T.UnsignedInt248Type;
  var UnsignedInt5999Type = T.UnsignedInt5999Type;
  var UnsignedIntType = T.UnsignedIntType;
  var UnsignedShort4444Type = T.UnsignedShort4444Type;
  var UnsignedShort5551Type = T.UnsignedShort5551Type;
  var UnsignedShortType = T.UnsignedShortType;
  var VSMShadowMap = T.VSMShadowMap;
  var Vector2 = T.Vector2;
  var Vector3 = T.Vector3;
  var Vector4 = T.Vector4;
  var VectorKeyframeTrack = T.VectorKeyframeTrack;
  var VideoFrameTexture = T.VideoFrameTexture;
  var VideoTexture = T.VideoTexture;
  var WebGL3DRenderTarget = T.WebGL3DRenderTarget;
  var WebGLArrayRenderTarget = T.WebGLArrayRenderTarget;
  var WebGLCoordinateSystem = T.WebGLCoordinateSystem;
  var WebGLRenderTarget = T.WebGLRenderTarget;
  var WebGPUCoordinateSystem = T.WebGPUCoordinateSystem;
  var WebXRController = T.WebXRController;
  var WireframeGeometry = T.WireframeGeometry;
  var WrapAroundEnding = T.WrapAroundEnding;
  var ZeroCurvatureEnding = T.ZeroCurvatureEnding;
  var ZeroFactor = T.ZeroFactor;
  var ZeroSlopeEnding = T.ZeroSlopeEnding;
  var ZeroStencilOp = T.ZeroStencilOp;
  var cloneUniforms = T.cloneUniforms;
  var createCanvasElement = T.createCanvasElement;
  var createElementNS = T.createElementNS;
  var error = T.error;
  var floorPowerOfTwo = T.floorPowerOfTwo;
  var generateUUID = T.generateUUID;
  var getByteLength = T.getByteLength;
  var getConsoleFunction = T.getConsoleFunction;
  var getUnlitUniformColorSpace = T.getUnlitUniformColorSpace;
  var isTypedArray = T.isTypedArray;
  var lerp = T.lerp;
  var log = T.log;
  var mergeUniforms = T.mergeUniforms;
  var probeAsync = T.probeAsync;
  var setConsoleFunction = T.setConsoleFunction;
  var warn = T.warn;
  var warnOnce = T.warnOnce;
  var yieldToMain = T.yieldToMain;
  var PMREMGenerator = T.PMREMGenerator;
  var ShaderChunk = T.ShaderChunk;
  var ShaderLib = T.ShaderLib;
  var UniformsLib = T.UniformsLib;
  var WebGLCubeRenderTarget = T.WebGLCubeRenderTarget;
  var WebGLRenderer = T.WebGLRenderer;
  var WebGLUtils = T.WebGLUtils;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpression.ts
  var VRMExpression = class extends Object3D {
    constructor(expressionName) {
      super();
      /**
       * The current weight of the expression.
       *
       * You usually want to set the weight via {@link VRMExpressionManager.setValue}.
       *
       * It might also be controlled by the Three.js animation system.
       */
      this.weight = 0;
      /**
       * Interpret values greater than 0.5 as 1.0, ortherwise 0.0.
       */
      this.isBinary = false;
      /**
       * Specify how the expression overrides blink expressions.
       */
      this.overrideBlink = "none";
      /**
       * Specify how the expression overrides lookAt expressions.
       */
      this.overrideLookAt = "none";
      /**
       * Specify how the expression overrides mouth expressions.
       */
      this.overrideMouth = "none";
      /**
       * Binds that this expression influences.
       */
      this._binds = [];
      this.name = `VRMExpression_${expressionName}`;
      this.expressionName = expressionName;
      this.type = "VRMExpression";
      this.visible = false;
    }
    /**
     * Binds that this expression influences.
     */
    get binds() {
      return this._binds;
    }
    /**
     * A value represents how much it should override blink expressions.
     * `0.0` == no override at all, `1.0` == completely block the expressions.
     */
    get overrideBlinkAmount() {
      if (this.overrideBlink === "block") {
        return 0 < this.outputWeight ? 1 : 0;
      } else if (this.overrideBlink === "blend") {
        return this.outputWeight;
      } else {
        return 0;
      }
    }
    /**
     * A value represents how much it should override lookAt expressions.
     * `0.0` == no override at all, `1.0` == completely block the expressions.
     */
    get overrideLookAtAmount() {
      if (this.overrideLookAt === "block") {
        return 0 < this.outputWeight ? 1 : 0;
      } else if (this.overrideLookAt === "blend") {
        return this.outputWeight;
      } else {
        return 0;
      }
    }
    /**
     * A value represents how much it should override mouth expressions.
     * `0.0` == no override at all, `1.0` == completely block the expressions.
     */
    get overrideMouthAmount() {
      if (this.overrideMouth === "block") {
        return 0 < this.outputWeight ? 1 : 0;
      } else if (this.overrideMouth === "blend") {
        return this.outputWeight;
      } else {
        return 0;
      }
    }
    /**
     * An output weight of this expression, considering the {@link isBinary}.
     */
    get outputWeight() {
      if (this.isBinary) {
        return this.weight > 0.5 ? 1 : 0;
      }
      return this.weight;
    }
    /**
     * Add an expression bind to the expression.
     *
     * @param bind A bind to add
     */
    addBind(bind) {
      this._binds.push(bind);
    }
    /**
     * Delete an expression bind from the expression.
     *
     * @param bind A bind to delete
     */
    deleteBind(bind) {
      const index = this._binds.indexOf(bind);
      if (index >= 0) {
        this._binds.splice(index, 1);
      }
    }
    /**
     * Apply weight to every assigned blend shapes.
     * Should be called every frame.
     */
    applyWeight(options) {
      let actualWeight = this.outputWeight;
      actualWeight *= options?.multiplier ?? 1;
      if (this.isBinary && actualWeight < 1) {
        actualWeight = 0;
      }
      this._binds.forEach((bind) => bind.applyWeight(actualWeight));
    }
    /**
     * Clear previously assigned blend shapes.
     */
    clearAppliedWeight() {
      this._binds.forEach((bind) => bind.clearAppliedWeight());
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/utils/gltfExtractPrimitivesFromNode.ts
  function extractPrimitivesInternal(gltf, nodeIndex, node) {
    const json = gltf.parser.json;
    const schemaNode = json.nodes?.[nodeIndex];
    if (schemaNode == null) {
      console.warn(`extractPrimitivesInternal: Attempt to use nodes[${nodeIndex}] of glTF but the node doesn't exist`);
      return null;
    }
    const meshIndex = schemaNode.mesh;
    if (meshIndex == null) {
      return null;
    }
    const schemaMesh = json.meshes?.[meshIndex];
    if (schemaMesh == null) {
      console.warn(`extractPrimitivesInternal: Attempt to use meshes[${meshIndex}] of glTF but the mesh doesn't exist`);
      return null;
    }
    const primitiveCount = schemaMesh.primitives.length;
    const primitives = [];
    node.traverse((object) => {
      if (primitives.length < primitiveCount) {
        if (object.isMesh) {
          primitives.push(object);
        }
      }
    });
    return primitives;
  }
  async function gltfExtractPrimitivesFromNode(gltf, nodeIndex) {
    const node = await gltf.parser.getDependency("node", nodeIndex);
    return extractPrimitivesInternal(gltf, nodeIndex, node);
  }
  async function gltfExtractPrimitivesFromNodes(gltf) {
    const nodes = await gltf.parser.getDependencies("node");
    const map = /* @__PURE__ */ new Map();
    nodes.forEach((node, index) => {
      const result = extractPrimitivesInternal(gltf, index, node);
      if (result != null) {
        map.set(index, result);
      }
    });
    return map;
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionPresetName.ts
  var VRMExpressionPresetName = {
    Aa: "aa",
    Ih: "ih",
    Ou: "ou",
    Ee: "ee",
    Oh: "oh",
    Blink: "blink",
    Happy: "happy",
    Angry: "angry",
    Sad: "sad",
    Relaxed: "relaxed",
    LookUp: "lookUp",
    Surprised: "surprised",
    LookDown: "lookDown",
    LookLeft: "lookLeft",
    LookRight: "lookRight",
    BlinkLeft: "blinkLeft",
    BlinkRight: "blinkRight",
    Neutral: "neutral"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/utils/saturate.ts
  function saturate(value) {
    return Math.max(Math.min(value, 1), 0);
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionManager.ts
  var VRMExpressionManager = class _VRMExpressionManager {
    /**
     * Create a new {@link VRMExpressionManager}.
     */
    constructor() {
      /**
       * A set of name or preset name of expressions that will be overridden by {@link VRMExpression.overrideBlink}.
       */
      this.blinkExpressionNames = ["blink", "blinkLeft", "blinkRight"];
      /**
       * A set of name or preset name of expressions that will be overridden by {@link VRMExpression.overrideLookAt}.
       */
      this.lookAtExpressionNames = ["lookLeft", "lookRight", "lookUp", "lookDown"];
      /**
       * A set of name or preset name of expressions that will be overridden by {@link VRMExpression.overrideMouth}.
       */
      this.mouthExpressionNames = ["aa", "ee", "ih", "oh", "ou"];
      /**
       * A set of {@link VRMExpression}.
       * When you want to register expressions, use {@link registerExpression}
       */
      this._expressions = [];
      /**
       * A map from name to expression.
       */
      this._expressionMap = {};
    }
    get expressions() {
      return this._expressions.concat();
    }
    get expressionMap() {
      return Object.assign({}, this._expressionMap);
    }
    /**
     * A map from name to expression, but excluding custom expressions.
     */
    get presetExpressionMap() {
      const result = {};
      const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
      Object.entries(this._expressionMap).forEach(([name, expression]) => {
        if (presetNameSet.has(name)) {
          result[name] = expression;
        }
      });
      return result;
    }
    /**
     * A map from name to expression, but excluding preset expressions.
     */
    get customExpressionMap() {
      const result = {};
      const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
      Object.entries(this._expressionMap).forEach(([name, expression]) => {
        if (!presetNameSet.has(name)) {
          result[name] = expression;
        }
      });
      return result;
    }
    /**
     * Copy the given {@link VRMExpressionManager} into this one.
     * @param source The {@link VRMExpressionManager} you want to copy
     * @returns this
     */
    copy(source) {
      const expressions = this._expressions.concat();
      expressions.forEach((expression) => {
        this.unregisterExpression(expression);
      });
      source._expressions.forEach((expression) => {
        this.registerExpression(expression);
      });
      this.blinkExpressionNames = source.blinkExpressionNames.concat();
      this.lookAtExpressionNames = source.lookAtExpressionNames.concat();
      this.mouthExpressionNames = source.mouthExpressionNames.concat();
      return this;
    }
    /**
     * Returns a clone of this {@link VRMExpressionManager}.
     * @returns Copied {@link VRMExpressionManager}
     */
    clone() {
      return new _VRMExpressionManager().copy(this);
    }
    /**
     * Return a registered expression.
     * If it cannot find an expression, it will return `null` instead.
     *
     * @param name Name or preset name of the expression
     */
    getExpression(name) {
      return this._expressionMap[name] ?? null;
    }
    /**
     * Register an expression.
     *
     * @param expression {@link VRMExpression} that describes the expression
     */
    registerExpression(expression) {
      this._expressions.push(expression);
      this._expressionMap[expression.expressionName] = expression;
    }
    /**
     * Unregister an expression.
     *
     * @param expression The expression you want to unregister
     */
    unregisterExpression(expression) {
      const index = this._expressions.indexOf(expression);
      if (index === -1) {
        console.warn("VRMExpressionManager: The specified expressions is not registered");
      }
      this._expressions.splice(index, 1);
      delete this._expressionMap[expression.expressionName];
    }
    /**
     * Get the current weight of the specified expression.
     * If it doesn't have an expression of given name, it will return `null` instead.
     *
     * @param name Name of the expression
     */
    getValue(name) {
      const expression = this.getExpression(name);
      return expression?.weight ?? null;
    }
    /**
     * Set a weight to the specified expression.
     *
     * @param name Name of the expression
     * @param weight Weight
     */
    setValue(name, weight) {
      const expression = this.getExpression(name);
      if (expression) {
        expression.weight = saturate(weight);
      }
    }
    /**
     * Reset weights of all expressions to `0.0`.
     */
    resetValues() {
      this._expressions.forEach((expression) => {
        expression.weight = 0;
      });
    }
    /**
     * Get a track name of specified expression.
     * This track name is needed to manipulate its expression via keyframe animations.
     *
     * @example Manipulate an expression using keyframe animation
     * ```js
     * const trackName = vrm.expressionManager.getExpressionTrackName( 'blink' );
     * const track = new THREE.NumberKeyframeTrack(
     *   name,
     *   [ 0.0, 0.5, 1.0 ], // times
     *   [ 0.0, 1.0, 0.0 ] // values
     * );
     *
     * const clip = new THREE.AnimationClip(
     *   'blink', // name
     *   1.0, // duration
     *   [ track ] // tracks
     * );
     *
     * const mixer = new THREE.AnimationMixer( vrm.scene );
     * const action = mixer.clipAction( clip );
     * action.play();
     * ```
     *
     * @param name Name of the expression
     */
    getExpressionTrackName(name) {
      const expression = this.getExpression(name);
      return expression ? `${expression.name}.weight` : null;
    }
    /**
     * Update every expressions.
     */
    update() {
      const weightMultipliers = this._calculateWeightMultipliers();
      this._expressions.forEach((expression) => {
        expression.clearAppliedWeight();
      });
      this._expressions.forEach((expression) => {
        let multiplier = 1;
        const name = expression.expressionName;
        if (this.blinkExpressionNames.indexOf(name) !== -1) {
          multiplier *= weightMultipliers.blink;
        }
        if (this.lookAtExpressionNames.indexOf(name) !== -1) {
          multiplier *= weightMultipliers.lookAt;
        }
        if (this.mouthExpressionNames.indexOf(name) !== -1) {
          multiplier *= weightMultipliers.mouth;
        }
        expression.applyWeight({ multiplier });
      });
    }
    /**
     * Calculate sum of override amounts to see how much we should multiply weights of certain expressions.
     */
    _calculateWeightMultipliers() {
      let blink = 1;
      let lookAt = 1;
      let mouth = 1;
      this._expressions.forEach((expression) => {
        blink -= expression.overrideBlinkAmount;
        lookAt -= expression.overrideLookAtAmount;
        mouth -= expression.overrideMouthAmount;
      });
      blink = Math.max(0, blink);
      lookAt = Math.max(0, lookAt);
      mouth = Math.max(0, mouth);
      return { blink, lookAt, mouth };
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionMaterialColorType.ts
  var VRMExpressionMaterialColorType = {
    Color: "color",
    EmissionColor: "emissionColor",
    ShadeColor: "shadeColor",
    MatcapColor: "matcapColor",
    RimColor: "rimColor",
    OutlineColor: "outlineColor"
  };
  var v0ExpressionMaterialColorMap = {
    _Color: VRMExpressionMaterialColorType.Color,
    _EmissionColor: VRMExpressionMaterialColorType.EmissionColor,
    _ShadeColor: VRMExpressionMaterialColorType.ShadeColor,
    _RimColor: VRMExpressionMaterialColorType.RimColor,
    _OutlineColor: VRMExpressionMaterialColorType.OutlineColor
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionMaterialColorBind.ts
  var _color = new Color();
  var _VRMExpressionMaterialColorBind = class _VRMExpressionMaterialColorBind {
    constructor({
      material,
      type,
      targetValue,
      targetAlpha
    }) {
      this.material = material;
      this.type = type;
      this.targetValue = targetValue;
      this.targetAlpha = targetAlpha ?? 1;
      const color = this._initColorBindState();
      const alpha = this._initAlphaBindState();
      this._state = { color, alpha };
    }
    applyWeight(weight) {
      const { color, alpha } = this._state;
      if (color != null) {
        const { propertyName, deltaValue } = color;
        const target = this.material[propertyName];
        if (target != void 0) {
          target.add(_color.copy(deltaValue).multiplyScalar(weight));
        }
      }
      if (alpha != null) {
        const { propertyName, deltaValue } = alpha;
        const target = this.material[propertyName];
        if (target != void 0) {
          this.material[propertyName] += deltaValue * weight;
        }
      }
    }
    clearAppliedWeight() {
      const { color, alpha } = this._state;
      if (color != null) {
        const { propertyName, initialValue } = color;
        const target = this.material[propertyName];
        if (target != void 0) {
          target.copy(initialValue);
        }
      }
      if (alpha != null) {
        const { propertyName, initialValue } = alpha;
        const target = this.material[propertyName];
        if (target != void 0) {
          this.material[propertyName] = initialValue;
        }
      }
    }
    _initColorBindState() {
      const { material, type, targetValue } = this;
      const propertyNameMap = this._getPropertyNameMap();
      const propertyName = propertyNameMap?.[type]?.[0] ?? null;
      if (propertyName == null) {
        console.warn(
          `Tried to add a material color bind to the material ${material.name ?? "(no name)"}, the type ${type} but the material or the type is not supported.`
        );
        return null;
      }
      const target = material[propertyName];
      const initialValue = target.clone();
      const deltaValue = new Color(
        targetValue.r - initialValue.r,
        targetValue.g - initialValue.g,
        targetValue.b - initialValue.b
      );
      return { propertyName, initialValue, deltaValue };
    }
    _initAlphaBindState() {
      const { material, type, targetAlpha } = this;
      const propertyNameMap = this._getPropertyNameMap();
      const propertyName = propertyNameMap?.[type]?.[1] ?? null;
      if (propertyName == null && targetAlpha !== 1) {
        console.warn(
          `Tried to add a material alpha bind to the material ${material.name ?? "(no name)"}, the type ${type} but the material or the type does not support alpha.`
        );
        return null;
      }
      if (propertyName == null) {
        return null;
      }
      const initialValue = material[propertyName];
      const deltaValue = targetAlpha - initialValue;
      return { propertyName, initialValue, deltaValue };
    }
    _getPropertyNameMap() {
      return Object.entries(_VRMExpressionMaterialColorBind._propertyNameMapMap).find(([distinguisher]) => {
        return this.material[distinguisher] === true;
      })?.[1] ?? null;
    }
  };
  /**
   * Mapping of property names from VRMC/materialColorBinds.type to three.js/Material.
   * The first element stands for color channels, the second element stands for the alpha channel.
   * The second element can be null if the target property doesn't exist.
   */
  // TODO: We might want to use the `satisfies` operator once we bump TS to 4.9 or higher
  // See: https://github.com/pixiv/three-vrm/pull/1323#discussion_r1374020035
  _VRMExpressionMaterialColorBind._propertyNameMapMap = {
    isMeshStandardMaterial: {
      color: ["color", "opacity"],
      emissionColor: ["emissive", null]
    },
    isMeshBasicMaterial: {
      color: ["color", "opacity"]
    },
    isMToonMaterial: {
      color: ["color", "opacity"],
      emissionColor: ["emissive", null],
      outlineColor: ["outlineColorFactor", null],
      matcapColor: ["matcapFactor", null],
      rimColor: ["parametricRimColorFactor", null],
      shadeColor: ["shadeColorFactor", null]
    }
  };
  var VRMExpressionMaterialColorBind = _VRMExpressionMaterialColorBind;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionMorphTargetBind.ts
  var VRMExpressionMorphTargetBind = class {
    constructor({
      primitives,
      index,
      weight
    }) {
      this.primitives = primitives;
      this.index = index;
      this.weight = weight;
    }
    applyWeight(weight) {
      this.primitives.forEach((mesh) => {
        if (mesh.morphTargetInfluences?.[this.index] != null) {
          mesh.morphTargetInfluences[this.index] += this.weight * weight;
        }
      });
    }
    clearAppliedWeight() {
      this.primitives.forEach((mesh) => {
        if (mesh.morphTargetInfluences?.[this.index] != null) {
          mesh.morphTargetInfluences[this.index] = 0;
        }
      });
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionTextureTransformBind.ts
  var _v2 = new Vector2();
  var _VRMExpressionTextureTransformBind = class _VRMExpressionTextureTransformBind {
    constructor({
      material,
      scale,
      offset
    }) {
      this.material = material;
      this.scale = scale;
      this.offset = offset;
      const propertyNames = Object.entries(_VRMExpressionTextureTransformBind._propertyNamesMap).find(
        ([distinguisher]) => {
          return material[distinguisher] === true;
        }
      )?.[1];
      if (propertyNames == null) {
        console.warn(
          `Tried to add a texture transform bind to the material ${material.name ?? "(no name)"} but the material is not supported.`
        );
        this._properties = [];
      } else {
        this._properties = [];
        propertyNames.forEach((propertyName) => {
          const texture = material[propertyName]?.clone();
          if (!texture) {
            return null;
          }
          material[propertyName] = texture;
          const initialOffset = texture.offset.clone();
          const initialScale = texture.repeat.clone();
          const deltaOffset = offset.clone().sub(initialOffset);
          const deltaScale = scale.clone().sub(initialScale);
          this._properties.push({
            name: propertyName,
            initialOffset,
            deltaOffset,
            initialScale,
            deltaScale
          });
        });
      }
    }
    applyWeight(weight) {
      this._properties.forEach((property) => {
        const target = this.material[property.name];
        if (target === void 0) {
          return;
        }
        target.offset.add(_v2.copy(property.deltaOffset).multiplyScalar(weight));
        target.repeat.add(_v2.copy(property.deltaScale).multiplyScalar(weight));
      });
    }
    clearAppliedWeight() {
      this._properties.forEach((property) => {
        const target = this.material[property.name];
        if (target === void 0) {
          return;
        }
        target.offset.copy(property.initialOffset);
        target.repeat.copy(property.initialScale);
      });
    }
  };
  _VRMExpressionTextureTransformBind._propertyNamesMap = {
    isMeshStandardMaterial: [
      "map",
      "emissiveMap",
      "bumpMap",
      "normalMap",
      "displacementMap",
      "roughnessMap",
      "metalnessMap",
      "alphaMap"
    ],
    isMeshBasicMaterial: ["map", "specularMap", "alphaMap"],
    isMToonMaterial: [
      "map",
      "normalMap",
      "emissiveMap",
      "shadeMultiplyTexture",
      "rimMultiplyTexture",
      "outlineWidthMultiplyTexture",
      "uvAnimationMaskTexture"
    ]
  };
  var VRMExpressionTextureTransformBind = _VRMExpressionTextureTransformBind;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var _VRMExpressionLoaderPlugin = class _VRMExpressionLoaderPlugin {
    get name() {
      return "VRMExpressionLoaderPlugin";
    }
    constructor(parser) {
      this.parser = parser;
    }
    async afterRoot(gltf) {
      gltf.userData.vrmExpressionManager = await this._import(gltf);
    }
    /**
     * Import a {@link VRMExpressionManager} from a VRM.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     */
    async _import(gltf) {
      const v1Result = await this._v1Import(gltf);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf);
      if (v0Result) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf) {
      const json = this.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRMC_vrm") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS.has(specVersion)) {
        console.warn(`VRMExpressionLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaExpressions = extension.expressions;
      if (!schemaExpressions) {
        return null;
      }
      const presetNameSet = new Set(Object.values(VRMExpressionPresetName));
      const nameSchemaExpressionMap = /* @__PURE__ */ new Map();
      if (schemaExpressions.preset != null) {
        Object.entries(schemaExpressions.preset).forEach(([name, schemaExpression]) => {
          if (schemaExpression == null) {
            return;
          }
          if (!presetNameSet.has(name)) {
            console.warn(`VRMExpressionLoaderPlugin: Unknown preset name "${name}" detected. Ignoring the expression`);
            return;
          }
          nameSchemaExpressionMap.set(name, schemaExpression);
        });
      }
      if (schemaExpressions.custom != null) {
        Object.entries(schemaExpressions.custom).forEach(([name, schemaExpression]) => {
          if (presetNameSet.has(name)) {
            console.warn(
              `VRMExpressionLoaderPlugin: Custom expression cannot have preset name "${name}". Ignoring the expression`
            );
            return;
          }
          nameSchemaExpressionMap.set(name, schemaExpression);
        });
      }
      const manager = new VRMExpressionManager();
      await Promise.all(
        Array.from(nameSchemaExpressionMap.entries()).map(async ([name, schemaExpression]) => {
          const expression = new VRMExpression(name);
          gltf.scene.add(expression);
          expression.isBinary = schemaExpression.isBinary ?? false;
          expression.overrideBlink = schemaExpression.overrideBlink ?? "none";
          expression.overrideLookAt = schemaExpression.overrideLookAt ?? "none";
          expression.overrideMouth = schemaExpression.overrideMouth ?? "none";
          schemaExpression.morphTargetBinds?.forEach(async (bind) => {
            if (bind.node === void 0 || bind.index === void 0) {
              return;
            }
            const primitives = await gltfExtractPrimitivesFromNode(gltf, bind.node);
            const morphTargetIndex = bind.index;
            if (!primitives.every(
              (primitive) => Array.isArray(primitive.morphTargetInfluences) && morphTargetIndex < primitive.morphTargetInfluences.length
            )) {
              console.warn(
                `VRMExpressionLoaderPlugin: ${schemaExpression.name} attempts to index morph #${morphTargetIndex} but not found.`
              );
              return;
            }
            expression.addBind(
              new VRMExpressionMorphTargetBind({
                primitives,
                index: morphTargetIndex,
                weight: bind.weight ?? 1
              })
            );
          });
          if (schemaExpression.materialColorBinds || schemaExpression.textureTransformBinds) {
            const gltfMaterials = [];
            gltf.scene.traverse((object) => {
              const material = object.material;
              if (material) {
                if (Array.isArray(material)) {
                  gltfMaterials.push(...material);
                } else {
                  gltfMaterials.push(material);
                }
              }
            });
            schemaExpression.materialColorBinds?.forEach(async (bind) => {
              const materials = gltfMaterials.filter((material) => {
                const materialIndex = this.parser.associations.get(material)?.materials;
                return bind.material === materialIndex;
              });
              materials.forEach((material) => {
                expression.addBind(
                  new VRMExpressionMaterialColorBind({
                    material,
                    type: bind.type,
                    targetValue: new Color().fromArray(bind.targetValue),
                    targetAlpha: bind.targetValue[3]
                  })
                );
              });
            });
            schemaExpression.textureTransformBinds?.forEach(async (bind) => {
              const materials = gltfMaterials.filter((material) => {
                const materialIndex = this.parser.associations.get(material)?.materials;
                return bind.material === materialIndex;
              });
              materials.forEach((material) => {
                expression.addBind(
                  new VRMExpressionTextureTransformBind({
                    material,
                    offset: new Vector2().fromArray(bind.offset ?? [0, 0]),
                    scale: new Vector2().fromArray(bind.scale ?? [1, 1])
                  })
                );
              });
            });
          }
          manager.registerExpression(expression);
        })
      );
      return manager;
    }
    async _v0Import(gltf) {
      const json = this.parser.json;
      const vrmExt = json.extensions?.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaBlendShape = vrmExt.blendShapeMaster;
      if (!schemaBlendShape) {
        return null;
      }
      const manager = new VRMExpressionManager();
      const schemaBlendShapeGroups = schemaBlendShape.blendShapeGroups;
      if (!schemaBlendShapeGroups) {
        return manager;
      }
      const blendShapeNameSet = /* @__PURE__ */ new Set();
      await Promise.all(
        schemaBlendShapeGroups.map(async (schemaGroup) => {
          const v0PresetName = schemaGroup.presetName;
          const v1PresetName = v0PresetName != null && _VRMExpressionLoaderPlugin.v0v1PresetNameMap[v0PresetName] || null;
          const name = v1PresetName ?? schemaGroup.name;
          if (name == null) {
            console.warn("VRMExpressionLoaderPlugin: One of custom expressions has no name. Ignoring the expression");
            return;
          }
          if (blendShapeNameSet.has(name)) {
            console.warn(
              `VRMExpressionLoaderPlugin: An expression preset ${v0PresetName} has duplicated entries. Ignoring the expression`
            );
            return;
          }
          blendShapeNameSet.add(name);
          const expression = new VRMExpression(name);
          gltf.scene.add(expression);
          expression.isBinary = schemaGroup.isBinary ?? false;
          if (schemaGroup.binds) {
            schemaGroup.binds.forEach(async (bind) => {
              if (bind.mesh === void 0 || bind.index === void 0) {
                return;
              }
              const nodesUsingMesh = [];
              json.nodes?.forEach((node, i) => {
                if (node.mesh === bind.mesh) {
                  nodesUsingMesh.push(i);
                }
              });
              if (nodesUsingMesh.length === 0) {
                console.warn(
                  `VRMExpressionLoaderPlugin: ${schemaGroup.name} attempts to bind a morph target to the mesh #${bind.mesh} but the mesh is not found or not used in the scene. Ignoring the bind.`
                );
                return;
              }
              const morphTargetIndex = bind.index;
              await Promise.all(
                nodesUsingMesh.map(async (nodeIndex) => {
                  const primitives = await gltfExtractPrimitivesFromNode(gltf, nodeIndex);
                  if (!primitives.every(
                    (primitive) => Array.isArray(primitive.morphTargetInfluences) && morphTargetIndex < primitive.morphTargetInfluences.length
                  )) {
                    console.warn(
                      `VRMExpressionLoaderPlugin: ${schemaGroup.name} attempts to index ${morphTargetIndex}th morph but not found.`
                    );
                    return;
                  }
                  expression.addBind(
                    new VRMExpressionMorphTargetBind({
                      primitives,
                      index: morphTargetIndex,
                      weight: 0.01 * (bind.weight ?? 100)
                      // narrowing the range from [ 0.0 - 100.0 ] to [ 0.0 - 1.0 ]
                    })
                  );
                })
              );
            });
          }
          const materialValues = schemaGroup.materialValues;
          if (materialValues && materialValues.length !== 0) {
            materialValues.forEach((materialValue) => {
              if (materialValue.materialName === void 0 || materialValue.propertyName === void 0 || materialValue.targetValue === void 0) {
                return;
              }
              const materials = [];
              gltf.scene.traverse((object) => {
                if (object.material) {
                  const material = object.material;
                  if (Array.isArray(material)) {
                    materials.push(
                      ...material.filter(
                        (mtl) => (mtl.name === materialValue.materialName || mtl.name === materialValue.materialName + " (Outline)") && materials.indexOf(mtl) === -1
                      )
                    );
                  } else if (material.name === materialValue.materialName && materials.indexOf(material) === -1) {
                    materials.push(material);
                  }
                }
              });
              const materialPropertyName = materialValue.propertyName;
              materials.forEach((material) => {
                if (materialPropertyName === "_MainTex_ST") {
                  const scale = new Vector2(materialValue.targetValue[0], materialValue.targetValue[1]);
                  const offset = new Vector2(materialValue.targetValue[2], materialValue.targetValue[3]);
                  offset.y = 1 - offset.y - scale.y;
                  expression.addBind(
                    new VRMExpressionTextureTransformBind({
                      material,
                      scale,
                      offset
                    })
                  );
                  return;
                }
                const materialColorType = v0ExpressionMaterialColorMap[materialPropertyName];
                if (materialColorType) {
                  expression.addBind(
                    new VRMExpressionMaterialColorBind({
                      material,
                      type: materialColorType,
                      targetValue: new Color().fromArray(materialValue.targetValue),
                      targetAlpha: materialValue.targetValue[3]
                    })
                  );
                  return;
                }
                console.warn(materialPropertyName + " is not supported");
              });
            });
          }
          manager.registerExpression(expression);
        })
      );
      return manager;
    }
  };
  _VRMExpressionLoaderPlugin.v0v1PresetNameMap = {
    a: "aa",
    e: "ee",
    i: "ih",
    o: "oh",
    u: "ou",
    blink: "blink",
    joy: "happy",
    angry: "angry",
    sorrow: "sad",
    fun: "relaxed",
    lookup: "lookUp",
    lookdown: "lookDown",
    lookleft: "lookLeft",
    lookright: "lookRight",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    blink_l: "blinkLeft",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    blink_r: "blinkRight",
    neutral: "neutral"
  };
  var VRMExpressionLoaderPlugin = _VRMExpressionLoaderPlugin;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/expressions/VRMExpressionOverrideType.ts
  var VRMExpressionOverrideType = {
    None: "none",
    Block: "block",
    Blend: "blend"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/firstPerson/VRMFirstPerson.ts
  var _VRMFirstPerson = class _VRMFirstPerson {
    /**
     * Create a new VRMFirstPerson object.
     *
     * @param humanoid A {@link VRMHumanoid}
     * @param meshAnnotations A {@link VRMFirstPersonMeshAnnotation}
     */
    constructor(humanoid, meshAnnotations) {
      this._firstPersonOnlyLayer = _VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER;
      this._thirdPersonOnlyLayer = _VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER;
      this._initializedLayers = false;
      this.humanoid = humanoid;
      this.meshAnnotations = meshAnnotations;
    }
    /**
     * Copy the given {@link VRMFirstPerson} into this one.
     * {@link humanoid} must be same as the source one.
     * @param source The {@link VRMFirstPerson} you want to copy
     * @returns this
     */
    copy(source) {
      if (this.humanoid !== source.humanoid) {
        throw new Error("VRMFirstPerson: humanoid must be same in order to copy");
      }
      this.meshAnnotations = source.meshAnnotations.map((annotation) => ({
        meshes: annotation.meshes.concat(),
        type: annotation.type
      }));
      return this;
    }
    /**
     * Returns a clone of this {@link VRMFirstPerson}.
     * @returns Copied {@link VRMFirstPerson}
     */
    clone() {
      return new _VRMFirstPerson(this.humanoid, this.meshAnnotations).copy(this);
    }
    /**
     * A camera layer represents `FirstPersonOnly` layer.
     * Note that **you must call {@link setup} first before you use the layer feature** or it does not work properly.
     *
     * The value is {@link DEFAULT_FIRSTPERSON_ONLY_LAYER} by default but you can change the layer by specifying via {@link setup} if you prefer.
     *
     * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
     * @see https://threejs.org/docs/#api/en/core/Layers
     */
    get firstPersonOnlyLayer() {
      return this._firstPersonOnlyLayer;
    }
    /**
     * A camera layer represents `ThirdPersonOnly` layer.
     * Note that **you must call {@link setup} first before you use the layer feature** or it does not work properly.
     *
     * The value is {@link DEFAULT_THIRDPERSON_ONLY_LAYER} by default but you can change the layer by specifying via {@link setup} if you prefer.
     *
     * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
     * @see https://threejs.org/docs/#api/en/core/Layers
     */
    get thirdPersonOnlyLayer() {
      return this._thirdPersonOnlyLayer;
    }
    /**
     * In this method, it assigns layers for every meshes based on mesh annotations.
     * You must call this method first before you use the layer feature.
     *
     * This is an equivalent of [VRMFirstPerson.Setup](https://github.com/vrm-c/UniVRM/blob/73a5bd8fcddaa2a7a8735099a97e63c9db3e5ea0/Assets/VRM/Runtime/FirstPerson/VRMFirstPerson.cs#L295-L299) of the UniVRM.
     *
     * The `cameraLayer` parameter specifies which layer will be assigned for `FirstPersonOnly` / `ThirdPersonOnly`.
     * In UniVRM, we specified those by naming each desired layer as `FIRSTPERSON_ONLY_LAYER` / `THIRDPERSON_ONLY_LAYER`
     * but we are going to specify these layers at here since we are unable to name layers in Three.js.
     *
     * @param cameraLayer Specify which layer will be for `FirstPersonOnly` / `ThirdPersonOnly`.
     */
    setup({
      firstPersonOnlyLayer = _VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER,
      thirdPersonOnlyLayer = _VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER
    } = {}) {
      if (this._initializedLayers) {
        return;
      }
      this._firstPersonOnlyLayer = firstPersonOnlyLayer;
      this._thirdPersonOnlyLayer = thirdPersonOnlyLayer;
      this.meshAnnotations.forEach((item) => {
        item.meshes.forEach((mesh) => {
          if (item.type === "firstPersonOnly") {
            mesh.layers.set(this._firstPersonOnlyLayer);
            mesh.traverse((child) => child.layers.set(this._firstPersonOnlyLayer));
          } else if (item.type === "thirdPersonOnly") {
            mesh.layers.set(this._thirdPersonOnlyLayer);
            mesh.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
          } else if (item.type === "auto") {
            this._createHeadlessModel(mesh);
          }
        });
      });
      this._initializedLayers = true;
    }
    _excludeTriangles(triangles, bws, skinIndex, exclude) {
      let count = 0;
      if (bws != null && bws.length > 0) {
        for (let i = 0; i < triangles.length; i += 3) {
          const a = triangles[i];
          const b = triangles[i + 1];
          const c = triangles[i + 2];
          const bw0 = bws[a];
          const skin0 = skinIndex[a];
          if (bw0[0] > 0 && exclude.includes(skin0[0])) continue;
          if (bw0[1] > 0 && exclude.includes(skin0[1])) continue;
          if (bw0[2] > 0 && exclude.includes(skin0[2])) continue;
          if (bw0[3] > 0 && exclude.includes(skin0[3])) continue;
          const bw1 = bws[b];
          const skin1 = skinIndex[b];
          if (bw1[0] > 0 && exclude.includes(skin1[0])) continue;
          if (bw1[1] > 0 && exclude.includes(skin1[1])) continue;
          if (bw1[2] > 0 && exclude.includes(skin1[2])) continue;
          if (bw1[3] > 0 && exclude.includes(skin1[3])) continue;
          const bw2 = bws[c];
          const skin2 = skinIndex[c];
          if (bw2[0] > 0 && exclude.includes(skin2[0])) continue;
          if (bw2[1] > 0 && exclude.includes(skin2[1])) continue;
          if (bw2[2] > 0 && exclude.includes(skin2[2])) continue;
          if (bw2[3] > 0 && exclude.includes(skin2[3])) continue;
          triangles[count++] = a;
          triangles[count++] = b;
          triangles[count++] = c;
        }
      }
      return count;
    }
    _createErasedMesh(src, erasingBonesIndex) {
      const dst = new SkinnedMesh(src.geometry.clone(), src.material);
      dst.name = `${src.name}(erase)`;
      dst.frustumCulled = src.frustumCulled;
      dst.layers.set(this._firstPersonOnlyLayer);
      const geometry = dst.geometry;
      const skinIndexAttr = geometry.getAttribute("skinIndex");
      const skinIndexAttrArray = skinIndexAttr instanceof GLBufferAttribute ? [] : skinIndexAttr.array;
      const skinIndex = [];
      for (let i = 0; i < skinIndexAttrArray.length; i += 4) {
        skinIndex.push([
          skinIndexAttrArray[i],
          skinIndexAttrArray[i + 1],
          skinIndexAttrArray[i + 2],
          skinIndexAttrArray[i + 3]
        ]);
      }
      const skinWeightAttr = geometry.getAttribute("skinWeight");
      const skinWeightAttrArray = skinWeightAttr instanceof GLBufferAttribute ? [] : skinWeightAttr.array;
      const skinWeight = [];
      for (let i = 0; i < skinWeightAttrArray.length; i += 4) {
        skinWeight.push([
          skinWeightAttrArray[i],
          skinWeightAttrArray[i + 1],
          skinWeightAttrArray[i + 2],
          skinWeightAttrArray[i + 3]
        ]);
      }
      const index = geometry.getIndex();
      if (!index) {
        throw new Error("The geometry doesn't have an index buffer");
      }
      const oldTriangles = Array.from(index.array);
      const count = this._excludeTriangles(oldTriangles, skinWeight, skinIndex, erasingBonesIndex);
      const newTriangle = [];
      for (let i = 0; i < count; i++) {
        newTriangle[i] = oldTriangles[i];
      }
      geometry.setIndex(newTriangle);
      if (src.onBeforeRender) {
        dst.onBeforeRender = src.onBeforeRender;
      }
      dst.bind(new Skeleton(src.skeleton.bones, src.skeleton.boneInverses), new Matrix4());
      return dst;
    }
    _createHeadlessModelForSkinnedMesh(parent, mesh) {
      const eraseBoneIndexes = [];
      mesh.skeleton.bones.forEach((bone, index) => {
        if (this._isEraseTarget(bone)) eraseBoneIndexes.push(index);
      });
      if (!eraseBoneIndexes.length) {
        mesh.layers.enable(this._thirdPersonOnlyLayer);
        mesh.layers.enable(this._firstPersonOnlyLayer);
        return;
      }
      mesh.layers.set(this._thirdPersonOnlyLayer);
      const newMesh = this._createErasedMesh(mesh, eraseBoneIndexes);
      parent.add(newMesh);
    }
    _createHeadlessModel(node) {
      if (node.type === "Group") {
        node.layers.set(this._thirdPersonOnlyLayer);
        if (this._isEraseTarget(node)) {
          node.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
        } else {
          const parent = new Group();
          parent.name = `_headless_${node.name}`;
          parent.layers.set(this._firstPersonOnlyLayer);
          node.parent.add(parent);
          node.children.filter((child) => child.type === "SkinnedMesh").forEach((child) => {
            const skinnedMesh = child;
            this._createHeadlessModelForSkinnedMesh(parent, skinnedMesh);
          });
        }
      } else if (node.type === "SkinnedMesh") {
        const skinnedMesh = node;
        this._createHeadlessModelForSkinnedMesh(node.parent, skinnedMesh);
      } else {
        if (this._isEraseTarget(node)) {
          node.layers.set(this._thirdPersonOnlyLayer);
          node.traverse((child) => child.layers.set(this._thirdPersonOnlyLayer));
        }
      }
    }
    _isEraseTarget(bone) {
      if (bone === this.humanoid.getRawBoneNode("head")) {
        return true;
      } else if (!bone.parent) {
        return false;
      } else {
        return this._isEraseTarget(bone.parent);
      }
    }
  };
  /**
   * A default camera layer for `FirstPersonOnly` layer.
   *
   * @see {@link firstPersonOnlyLayer}
   */
  _VRMFirstPerson.DEFAULT_FIRSTPERSON_ONLY_LAYER = 9;
  /**
   * A default camera layer for `ThirdPersonOnly` layer.
   *
   * @see {@link thirdPersonOnlyLayer}
   */
  _VRMFirstPerson.DEFAULT_THIRDPERSON_ONLY_LAYER = 10;
  var VRMFirstPerson = _VRMFirstPerson;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/firstPerson/VRMFirstPersonLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS2 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var VRMFirstPersonLoaderPlugin = class {
    get name() {
      return "VRMFirstPersonLoaderPlugin";
    }
    constructor(parser) {
      this.parser = parser;
    }
    async afterRoot(gltf) {
      const vrmHumanoid = gltf.userData.vrmHumanoid;
      if (vrmHumanoid === null) {
        return;
      } else if (vrmHumanoid === void 0) {
        throw new Error(
          "VRMFirstPersonLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first"
        );
      }
      gltf.userData.vrmFirstPerson = await this._import(gltf, vrmHumanoid);
    }
    /**
     * Import a {@link VRMFirstPerson} from a VRM.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     * @param humanoid A {@link VRMHumanoid} instance that represents the VRM
     */
    async _import(gltf, humanoid) {
      if (humanoid == null) {
        return null;
      }
      const v1Result = await this._v1Import(gltf, humanoid);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf, humanoid);
      if (v0Result) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf, humanoid) {
      const json = this.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRMC_vrm") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS2.has(specVersion)) {
        console.warn(`VRMFirstPersonLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaFirstPerson = extension.firstPerson;
      const meshAnnotations = [];
      const nodePrimitivesMap = await gltfExtractPrimitivesFromNodes(gltf);
      Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
        const annotation = schemaFirstPerson?.meshAnnotations?.find((a) => a.node === nodeIndex);
        meshAnnotations.push({
          meshes: primitives,
          type: annotation?.type ?? "auto"
        });
      });
      return new VRMFirstPerson(humanoid, meshAnnotations);
    }
    async _v0Import(gltf, humanoid) {
      const json = this.parser.json;
      const vrmExt = json.extensions?.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaFirstPerson = vrmExt.firstPerson;
      if (!schemaFirstPerson) {
        return null;
      }
      const meshAnnotations = [];
      const nodePrimitivesMap = await gltfExtractPrimitivesFromNodes(gltf);
      Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
        const schemaNode = json.nodes[nodeIndex];
        const flag = schemaFirstPerson.meshAnnotations ? schemaFirstPerson.meshAnnotations.find((a) => a.mesh === schemaNode.mesh) : void 0;
        meshAnnotations.push({
          meshes: primitives,
          type: this._convertV0FlagToV1Type(flag?.firstPersonFlag)
        });
      });
      return new VRMFirstPerson(humanoid, meshAnnotations);
    }
    _convertV0FlagToV1Type(flag) {
      if (flag === "FirstPersonOnly") {
        return "firstPersonOnly";
      } else if (flag === "ThirdPersonOnly") {
        return "thirdPersonOnly";
      } else if (flag === "Both") {
        return "both";
      } else {
        return "auto";
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/firstPerson/VRMFirstPersonMeshAnnotationType.ts
  var VRMFirstPersonMeshAnnotationType = {
    Auto: "auto",
    Both: "both",
    ThirdPersonOnly: "thirdPersonOnly",
    FirstPersonOnly: "firstPersonOnly"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/helpers/VRMHumanoidHelper.ts
  var _v3A = new Vector3();
  var _v3B = new Vector3();
  var _quatA = new Quaternion();
  var VRMHumanoidHelper = class extends Group {
    constructor(humanoid) {
      super();
      this.vrmHumanoid = humanoid;
      this._boneAxesMap = /* @__PURE__ */ new Map();
      Object.values(humanoid.humanBones).forEach((bone) => {
        const helper = new AxesHelper(1);
        helper.matrixAutoUpdate = false;
        helper.material.depthTest = false;
        helper.material.depthWrite = false;
        this.add(helper);
        this._boneAxesMap.set(bone, helper);
      });
    }
    dispose() {
      Array.from(this._boneAxesMap.values()).forEach((axes) => {
        axes.geometry.dispose();
        axes.material.dispose();
      });
    }
    updateMatrixWorld(force) {
      Array.from(this._boneAxesMap.entries()).forEach(([bone, axes]) => {
        bone.node.updateWorldMatrix(true, false);
        bone.node.matrixWorld.decompose(_v3A, _quatA, _v3B);
        const scale = _v3A.set(0.1, 0.1, 0.1).divide(_v3B);
        axes.matrix.copy(bone.node.matrixWorld).scale(scale);
      });
      super.updateMatrixWorld(force);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanBoneList.ts
  var VRMHumanBoneList = [
    "hips",
    "spine",
    "chest",
    "upperChest",
    "neck",
    "head",
    "leftEye",
    "rightEye",
    "jaw",
    "leftUpperLeg",
    "leftLowerLeg",
    "leftFoot",
    "leftToes",
    "rightUpperLeg",
    "rightLowerLeg",
    "rightFoot",
    "rightToes",
    "leftShoulder",
    "leftUpperArm",
    "leftLowerArm",
    "leftHand",
    "rightShoulder",
    "rightUpperArm",
    "rightLowerArm",
    "rightHand",
    "leftThumbMetacarpal",
    "leftThumbProximal",
    "leftThumbDistal",
    "leftIndexProximal",
    "leftIndexIntermediate",
    "leftIndexDistal",
    "leftMiddleProximal",
    "leftMiddleIntermediate",
    "leftMiddleDistal",
    "leftRingProximal",
    "leftRingIntermediate",
    "leftRingDistal",
    "leftLittleProximal",
    "leftLittleIntermediate",
    "leftLittleDistal",
    "rightThumbMetacarpal",
    "rightThumbProximal",
    "rightThumbDistal",
    "rightIndexProximal",
    "rightIndexIntermediate",
    "rightIndexDistal",
    "rightMiddleProximal",
    "rightMiddleIntermediate",
    "rightMiddleDistal",
    "rightRingProximal",
    "rightRingIntermediate",
    "rightRingDistal",
    "rightLittleProximal",
    "rightLittleIntermediate",
    "rightLittleDistal"
  ];

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanBoneName.ts
  var VRMHumanBoneName = {
    Hips: "hips",
    Spine: "spine",
    Chest: "chest",
    UpperChest: "upperChest",
    Neck: "neck",
    Head: "head",
    LeftEye: "leftEye",
    RightEye: "rightEye",
    Jaw: "jaw",
    LeftUpperLeg: "leftUpperLeg",
    LeftLowerLeg: "leftLowerLeg",
    LeftFoot: "leftFoot",
    LeftToes: "leftToes",
    RightUpperLeg: "rightUpperLeg",
    RightLowerLeg: "rightLowerLeg",
    RightFoot: "rightFoot",
    RightToes: "rightToes",
    LeftShoulder: "leftShoulder",
    LeftUpperArm: "leftUpperArm",
    LeftLowerArm: "leftLowerArm",
    LeftHand: "leftHand",
    RightShoulder: "rightShoulder",
    RightUpperArm: "rightUpperArm",
    RightLowerArm: "rightLowerArm",
    RightHand: "rightHand",
    LeftThumbMetacarpal: "leftThumbMetacarpal",
    LeftThumbProximal: "leftThumbProximal",
    LeftThumbDistal: "leftThumbDistal",
    LeftIndexProximal: "leftIndexProximal",
    LeftIndexIntermediate: "leftIndexIntermediate",
    LeftIndexDistal: "leftIndexDistal",
    LeftMiddleProximal: "leftMiddleProximal",
    LeftMiddleIntermediate: "leftMiddleIntermediate",
    LeftMiddleDistal: "leftMiddleDistal",
    LeftRingProximal: "leftRingProximal",
    LeftRingIntermediate: "leftRingIntermediate",
    LeftRingDistal: "leftRingDistal",
    LeftLittleProximal: "leftLittleProximal",
    LeftLittleIntermediate: "leftLittleIntermediate",
    LeftLittleDistal: "leftLittleDistal",
    RightThumbMetacarpal: "rightThumbMetacarpal",
    RightThumbProximal: "rightThumbProximal",
    RightThumbDistal: "rightThumbDistal",
    RightIndexProximal: "rightIndexProximal",
    RightIndexIntermediate: "rightIndexIntermediate",
    RightIndexDistal: "rightIndexDistal",
    RightMiddleProximal: "rightMiddleProximal",
    RightMiddleIntermediate: "rightMiddleIntermediate",
    RightMiddleDistal: "rightMiddleDistal",
    RightRingProximal: "rightRingProximal",
    RightRingIntermediate: "rightRingIntermediate",
    RightRingDistal: "rightRingDistal",
    RightLittleProximal: "rightLittleProximal",
    RightLittleIntermediate: "rightLittleIntermediate",
    RightLittleDistal: "rightLittleDistal"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanBoneParentMap.ts
  var VRMHumanBoneParentMap = {
    hips: null,
    spine: "hips",
    chest: "spine",
    upperChest: "chest",
    neck: "upperChest",
    head: "neck",
    leftEye: "head",
    rightEye: "head",
    jaw: "head",
    leftUpperLeg: "hips",
    leftLowerLeg: "leftUpperLeg",
    leftFoot: "leftLowerLeg",
    leftToes: "leftFoot",
    rightUpperLeg: "hips",
    rightLowerLeg: "rightUpperLeg",
    rightFoot: "rightLowerLeg",
    rightToes: "rightFoot",
    leftShoulder: "upperChest",
    leftUpperArm: "leftShoulder",
    leftLowerArm: "leftUpperArm",
    leftHand: "leftLowerArm",
    rightShoulder: "upperChest",
    rightUpperArm: "rightShoulder",
    rightLowerArm: "rightUpperArm",
    rightHand: "rightLowerArm",
    leftThumbMetacarpal: "leftHand",
    leftThumbProximal: "leftThumbMetacarpal",
    leftThumbDistal: "leftThumbProximal",
    leftIndexProximal: "leftHand",
    leftIndexIntermediate: "leftIndexProximal",
    leftIndexDistal: "leftIndexIntermediate",
    leftMiddleProximal: "leftHand",
    leftMiddleIntermediate: "leftMiddleProximal",
    leftMiddleDistal: "leftMiddleIntermediate",
    leftRingProximal: "leftHand",
    leftRingIntermediate: "leftRingProximal",
    leftRingDistal: "leftRingIntermediate",
    leftLittleProximal: "leftHand",
    leftLittleIntermediate: "leftLittleProximal",
    leftLittleDistal: "leftLittleIntermediate",
    rightThumbMetacarpal: "rightHand",
    rightThumbProximal: "rightThumbMetacarpal",
    rightThumbDistal: "rightThumbProximal",
    rightIndexProximal: "rightHand",
    rightIndexIntermediate: "rightIndexProximal",
    rightIndexDistal: "rightIndexIntermediate",
    rightMiddleProximal: "rightHand",
    rightMiddleIntermediate: "rightMiddleProximal",
    rightMiddleDistal: "rightMiddleIntermediate",
    rightRingProximal: "rightHand",
    rightRingIntermediate: "rightRingProximal",
    rightRingDistal: "rightRingIntermediate",
    rightLittleProximal: "rightHand",
    rightLittleIntermediate: "rightLittleProximal",
    rightLittleDistal: "rightLittleIntermediate"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/utils/quatInvertCompat.ts
  function quatInvertCompat(target) {
    if (target.invert) {
      target.invert();
    } else {
      target.inverse();
    }
    return target;
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMRig.ts
  var _v3A2 = new Vector3();
  var _quatA2 = new Quaternion();
  var VRMRig = class {
    /**
     * Create a new {@link VRMHumanoid}.
     * @param humanBones A {@link VRMHumanBones} contains all the bones of the new humanoid
     */
    constructor(humanBones) {
      this.humanBones = humanBones;
      this.restPose = this.getAbsolutePose();
    }
    /**
     * Return the current absolute pose of this humanoid as a {@link VRMPose}.
     * Note that the output result will contain initial state of the VRM and not compatible between different models.
     * You might want to use {@link getPose} instead.
     */
    getAbsolutePose() {
      const pose = {};
      Object.keys(this.humanBones).forEach((vrmBoneNameString) => {
        const vrmBoneName = vrmBoneNameString;
        const node = this.getBoneNode(vrmBoneName);
        if (!node) {
          return;
        }
        _v3A2.copy(node.position);
        _quatA2.copy(node.quaternion);
        pose[vrmBoneName] = {
          position: _v3A2.toArray(),
          rotation: _quatA2.toArray()
        };
      });
      return pose;
    }
    /**
     * Return the current pose of this humanoid as a {@link VRMPose}.
     *
     * Each transform is a local transform relative from rest pose (T-pose).
     */
    getPose() {
      const pose = {};
      Object.keys(this.humanBones).forEach((boneNameString) => {
        const boneName = boneNameString;
        const node = this.getBoneNode(boneName);
        if (!node) {
          return;
        }
        _v3A2.set(0, 0, 0);
        _quatA2.identity();
        const restState = this.restPose[boneName];
        if (restState?.position) {
          _v3A2.fromArray(restState.position).negate();
        }
        if (restState?.rotation) {
          quatInvertCompat(_quatA2.fromArray(restState.rotation));
        }
        _v3A2.add(node.position);
        _quatA2.premultiply(node.quaternion);
        pose[boneName] = {
          position: _v3A2.toArray(),
          rotation: _quatA2.toArray()
        };
      });
      return pose;
    }
    /**
     * Let the humanoid do a specified pose.
     *
     * Each transform have to be a local transform relative from rest pose (T-pose).
     * You can pass what you got from {@link getPose}.
     *
     * @param poseObject A {@link VRMPose} that represents a single pose
     */
    setPose(poseObject) {
      Object.entries(poseObject).forEach(([boneNameString, state]) => {
        const boneName = boneNameString;
        const node = this.getBoneNode(boneName);
        if (!node) {
          return;
        }
        const restState = this.restPose[boneName];
        if (!restState) {
          return;
        }
        if (state?.position) {
          node.position.fromArray(state.position);
          if (restState.position) {
            node.position.add(_v3A2.fromArray(restState.position));
          }
        }
        if (state?.rotation) {
          node.quaternion.fromArray(state.rotation);
          if (restState.rotation) {
            node.quaternion.multiply(_quatA2.fromArray(restState.rotation));
          }
        }
      });
    }
    /**
     * Reset the humanoid to its rest pose.
     */
    resetPose() {
      Object.entries(this.restPose).forEach(([boneName, rest]) => {
        const node = this.getBoneNode(boneName);
        if (!node) {
          return;
        }
        if (rest?.position) {
          node.position.fromArray(rest.position);
        }
        if (rest?.rotation) {
          node.quaternion.fromArray(rest.rotation);
        }
      });
    }
    /**
     * Return a bone bound to a specified {@link VRMHumanBoneName}, as a {@link VRMHumanBone}.
     *
     * @param name Name of the bone you want
     */
    getBone(name) {
      return this.humanBones[name] ?? void 0;
    }
    /**
     * Return a bone bound to a specified {@link VRMHumanBoneName}, as a `THREE.Object3D`.
     *
     * @param name Name of the bone you want
     */
    getBoneNode(name) {
      return this.humanBones[name]?.node ?? null;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanoidRig.ts
  var _v3A3 = new Vector3();
  var _quatA3 = new Quaternion();
  var _boneWorldPos = new Vector3();
  var VRMHumanoidRig = class _VRMHumanoidRig extends VRMRig {
    static _setupTransforms(modelRig) {
      const root = new Object3D();
      root.name = "VRMHumanoidRig";
      const boneWorldPositions = {};
      const boneWorldRotations = {};
      const boneRotations = {};
      const parentWorldRotations = {};
      VRMHumanBoneList.forEach((boneName) => {
        const boneNode = modelRig.getBoneNode(boneName);
        if (boneNode) {
          const boneWorldPosition = new Vector3();
          const boneWorldRotation = new Quaternion();
          boneNode.updateWorldMatrix(true, false);
          boneNode.matrixWorld.decompose(boneWorldPosition, boneWorldRotation, _v3A3);
          boneWorldPositions[boneName] = boneWorldPosition;
          boneWorldRotations[boneName] = boneWorldRotation;
          boneRotations[boneName] = boneNode.quaternion.clone();
          const parentWorldRotation = new Quaternion();
          boneNode.parent?.matrixWorld.decompose(_v3A3, parentWorldRotation, _v3A3);
          parentWorldRotations[boneName] = parentWorldRotation;
        }
      });
      const rigBones = {};
      VRMHumanBoneList.forEach((boneName) => {
        const boneNode = modelRig.getBoneNode(boneName);
        if (boneNode) {
          const boneWorldPosition = boneWorldPositions[boneName];
          let currentBoneName = boneName;
          let parentBoneWorldPosition;
          while (parentBoneWorldPosition == null) {
            currentBoneName = VRMHumanBoneParentMap[currentBoneName];
            if (currentBoneName == null) {
              break;
            }
            parentBoneWorldPosition = boneWorldPositions[currentBoneName];
          }
          const rigBoneNode = new Object3D();
          rigBoneNode.name = "Normalized_" + boneNode.name;
          const parentRigBoneNode = currentBoneName ? rigBones[currentBoneName]?.node : root;
          parentRigBoneNode.add(rigBoneNode);
          rigBoneNode.position.copy(boneWorldPosition);
          if (parentBoneWorldPosition) {
            rigBoneNode.position.sub(parentBoneWorldPosition);
          }
          rigBones[boneName] = { node: rigBoneNode };
        }
      });
      return {
        rigBones,
        root,
        parentWorldRotations,
        boneRotations
      };
    }
    constructor(humanoid) {
      const { rigBones, root, parentWorldRotations, boneRotations } = _VRMHumanoidRig._setupTransforms(humanoid);
      super(rigBones);
      this.original = humanoid;
      this.root = root;
      this._parentWorldRotations = parentWorldRotations;
      this._boneRotations = boneRotations;
    }
    /**
     * Update this humanoid rig.
     */
    update() {
      VRMHumanBoneList.forEach((boneName) => {
        const boneNode = this.original.getBoneNode(boneName);
        if (boneNode != null) {
          const rigBoneNode = this.getBoneNode(boneName);
          const parentWorldRotation = this._parentWorldRotations[boneName];
          const invParentWorldRotation = _quatA3.copy(parentWorldRotation).invert();
          const boneRotation = this._boneRotations[boneName];
          boneNode.quaternion.copy(rigBoneNode.quaternion).multiply(parentWorldRotation).premultiply(invParentWorldRotation).multiply(boneRotation);
          if (boneName === "hips") {
            const boneWorldPosition = rigBoneNode.getWorldPosition(_boneWorldPos);
            boneNode.parent.updateWorldMatrix(true, false);
            const parentWorldMatrix = boneNode.parent.matrixWorld;
            const localPosition = boneWorldPosition.applyMatrix4(parentWorldMatrix.invert());
            boneNode.position.copy(localPosition);
          }
        }
      });
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanoid.ts
  var VRMHumanoid = class _VRMHumanoid {
    // TODO: Rename
    /**
     * @deprecated Deprecated. Use either {@link rawRestPose} or {@link normalizedRestPose} instead.
     */
    get restPose() {
      console.warn("VRMHumanoid: restPose is deprecated. Use either rawRestPose or normalizedRestPose instead.");
      return this.rawRestPose;
    }
    /**
     * A {@link VRMPose} of its raw human bones that is its default state.
     * Note that it's not compatible with {@link setRawPose} and {@link getRawPose}, since it contains non-relative values of each local transforms.
     */
    get rawRestPose() {
      return this._rawHumanBones.restPose;
    }
    /**
     * A {@link VRMPose} of its normalized human bones that is its default state.
     * Note that it's not compatible with {@link setNormalizedPose} and {@link getNormalizedPose}, since it contains non-relative values of each local transforms.
     */
    get normalizedRestPose() {
      return this._normalizedHumanBones.restPose;
    }
    /**
     * A map from {@link VRMHumanBoneName} to raw {@link VRMHumanBone}s.
     */
    get humanBones() {
      return this._rawHumanBones.humanBones;
    }
    /**
     * A map from {@link VRMHumanBoneName} to raw {@link VRMHumanBone}s.
     */
    get rawHumanBones() {
      return this._rawHumanBones.humanBones;
    }
    /**
     * A map from {@link VRMHumanBoneName} to normalized {@link VRMHumanBone}s.
     */
    get normalizedHumanBones() {
      return this._normalizedHumanBones.humanBones;
    }
    /**
     * The root of normalized {@link VRMHumanBone}s.
     */
    get normalizedHumanBonesRoot() {
      return this._normalizedHumanBones.root;
    }
    /**
     * Create a new {@link VRMHumanoid}.
     * @param humanBones A {@link VRMHumanBones} contains all the bones of the new humanoid
     * @param autoUpdateHumanBones Whether it copies pose from normalizedHumanBones to rawHumanBones on {@link update}. `true` by default.
     */
    constructor(humanBones, options) {
      this.autoUpdateHumanBones = options?.autoUpdateHumanBones ?? true;
      this._rawHumanBones = new VRMRig(humanBones);
      this._normalizedHumanBones = new VRMHumanoidRig(this._rawHumanBones);
    }
    /**
     * Copy the given {@link VRMHumanoid} into this one.
     * @param source The {@link VRMHumanoid} you want to copy
     * @returns this
     */
    copy(source) {
      this.autoUpdateHumanBones = source.autoUpdateHumanBones;
      this._rawHumanBones = new VRMRig(source.humanBones);
      this._normalizedHumanBones = new VRMHumanoidRig(this._rawHumanBones);
      return this;
    }
    /**
     * Returns a clone of this {@link VRMHumanoid}.
     * @returns Copied {@link VRMHumanoid}
     */
    clone() {
      return new _VRMHumanoid(this.humanBones, { autoUpdateHumanBones: this.autoUpdateHumanBones }).copy(this);
    }
    /**
     * @deprecated Deprecated. Use either {@link getRawAbsolutePose} or {@link getNormalizedAbsolutePose} instead.
     */
    getAbsolutePose() {
      console.warn(
        "VRMHumanoid: getAbsolutePose() is deprecated. Use either getRawAbsolutePose() or getNormalizedAbsolutePose() instead."
      );
      return this.getRawAbsolutePose();
    }
    /**
     * Return the current absolute pose of this raw human bones as a {@link VRMPose}.
     * Note that the output result will contain initial state of the VRM and not compatible between different models.
     * You might want to use {@link getRawPose} instead.
     */
    getRawAbsolutePose() {
      return this._rawHumanBones.getAbsolutePose();
    }
    /**
     * Return the current absolute pose of this normalized human bones as a {@link VRMPose}.
     * Note that the output result will contain initial state of the VRM and not compatible between different models.
     * You might want to use {@link getNormalizedPose} instead.
     */
    getNormalizedAbsolutePose() {
      return this._normalizedHumanBones.getAbsolutePose();
    }
    /**
     * @deprecated Deprecated. Use either {@link getRawPose} or {@link getNormalizedPose} instead.
     */
    getPose() {
      console.warn("VRMHumanoid: getPose() is deprecated. Use either getRawPose() or getNormalizedPose() instead.");
      return this.getRawPose();
    }
    /**
     * Return the current pose of raw human bones as a {@link VRMPose}.
     *
     * Each transform is a local transform relative from rest pose (T-pose).
     */
    getRawPose() {
      return this._rawHumanBones.getPose();
    }
    /**
     * Return the current pose of normalized human bones as a {@link VRMPose}.
     *
     * Each transform is a local transform relative from rest pose (T-pose).
     */
    getNormalizedPose() {
      return this._normalizedHumanBones.getPose();
    }
    /**
     * @deprecated Deprecated. Use either {@link setRawPose} or {@link setNormalizedPose} instead.
     */
    setPose(poseObject) {
      console.warn("VRMHumanoid: setPose() is deprecated. Use either setRawPose() or setNormalizedPose() instead.");
      return this.setRawPose(poseObject);
    }
    /**
     * Let the raw human bones do a specified pose.
     *
     * Each transform have to be a local transform relative from rest pose (T-pose).
     * You can pass what you got from {@link getRawPose}.
     *
     * If you are using {@link autoUpdateHumanBones}, you might want to use {@link setNormalizedPose} instead.
     *
     * @param poseObject A {@link VRMPose} that represents a single pose
     */
    setRawPose(poseObject) {
      return this._rawHumanBones.setPose(poseObject);
    }
    /**
     * Let the normalized human bones do a specified pose.
     *
     * Each transform have to be a local transform relative from rest pose (T-pose).
     * You can pass what you got from {@link getNormalizedPose}.
     *
     * @param poseObject A {@link VRMPose} that represents a single pose
     */
    setNormalizedPose(poseObject) {
      return this._normalizedHumanBones.setPose(poseObject);
    }
    /**
     * @deprecated Deprecated. Use either {@link resetRawPose} or {@link resetNormalizedPose} instead.
     */
    resetPose() {
      console.warn("VRMHumanoid: resetPose() is deprecated. Use either resetRawPose() or resetNormalizedPose() instead.");
      return this.resetRawPose();
    }
    /**
     * Reset the raw humanoid to its rest pose.
     *
     * If you are using {@link autoUpdateHumanBones}, you might want to use {@link resetNormalizedPose} instead.
     */
    resetRawPose() {
      return this._rawHumanBones.resetPose();
    }
    /**
     * Reset the normalized humanoid to its rest pose.
     */
    resetNormalizedPose() {
      return this._normalizedHumanBones.resetPose();
    }
    /**
     * @deprecated Deprecated. Use either {@link getRawBone} or {@link getNormalizedBone} instead.
     */
    getBone(name) {
      console.warn("VRMHumanoid: getBone() is deprecated. Use either getRawBone() or getNormalizedBone() instead.");
      return this.getRawBone(name);
    }
    /**
     * Return a raw {@link VRMHumanBone} bound to a specified {@link VRMHumanBoneName}.
     *
     * @param name Name of the bone you want
     */
    getRawBone(name) {
      return this._rawHumanBones.getBone(name);
    }
    /**
     * Return a normalized {@link VRMHumanBone} bound to a specified {@link VRMHumanBoneName}.
     *
     * @param name Name of the bone you want
     */
    getNormalizedBone(name) {
      return this._normalizedHumanBones.getBone(name);
    }
    /**
     * @deprecated Deprecated. Use either {@link getRawBoneNode} or {@link getNormalizedBoneNode} instead.
     */
    getBoneNode(name) {
      console.warn(
        "VRMHumanoid: getBoneNode() is deprecated. Use either getRawBoneNode() or getNormalizedBoneNode() instead."
      );
      return this.getRawBoneNode(name);
    }
    /**
     * Return a raw bone as a `THREE.Object3D` bound to a specified {@link VRMHumanBoneName}.
     *
     * @param name Name of the bone you want
     */
    getRawBoneNode(name) {
      return this._rawHumanBones.getBoneNode(name);
    }
    /**
     * Return a normalized bone as a `THREE.Object3D` bound to a specified {@link VRMHumanBoneName}.
     *
     * @param name Name of the bone you want
     */
    getNormalizedBoneNode(name) {
      return this._normalizedHumanBones.getBoneNode(name);
    }
    /**
     * Update the humanoid component.
     *
     * If {@link autoUpdateHumanBones} is `true`, it transfers the pose of normalized human bones to raw human bones.
     */
    update() {
      if (this.autoUpdateHumanBones) {
        this._normalizedHumanBones.update();
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMRequiredHumanBoneName.ts
  var VRMRequiredHumanBoneName = {
    Hips: "hips",
    Spine: "spine",
    Head: "head",
    LeftUpperLeg: "leftUpperLeg",
    LeftLowerLeg: "leftLowerLeg",
    LeftFoot: "leftFoot",
    RightUpperLeg: "rightUpperLeg",
    RightLowerLeg: "rightLowerLeg",
    RightFoot: "rightFoot",
    LeftUpperArm: "leftUpperArm",
    LeftLowerArm: "leftLowerArm",
    LeftHand: "leftHand",
    RightUpperArm: "rightUpperArm",
    RightLowerArm: "rightLowerArm",
    RightHand: "rightHand"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/humanoid/VRMHumanoidLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS3 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var thumbBoneNameMap = {
    leftThumbProximal: "leftThumbMetacarpal",
    leftThumbIntermediate: "leftThumbProximal",
    rightThumbProximal: "rightThumbMetacarpal",
    rightThumbIntermediate: "rightThumbProximal"
  };
  var VRMHumanoidLoaderPlugin = class {
    get name() {
      return "VRMHumanoidLoaderPlugin";
    }
    constructor(parser, options) {
      this.parser = parser;
      this.helperRoot = options?.helperRoot;
      this.autoUpdateHumanBones = options?.autoUpdateHumanBones;
    }
    async afterRoot(gltf) {
      gltf.userData.vrmHumanoid = await this._import(gltf);
    }
    /**
     * Import a {@link VRMHumanoid} from a VRM.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     */
    async _import(gltf) {
      const v1Result = await this._v1Import(gltf);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf);
      if (v0Result) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf) {
      const json = this.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRMC_vrm") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS3.has(specVersion)) {
        console.warn(`VRMHumanoidLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaHumanoid = extension.humanoid;
      if (!schemaHumanoid) {
        return null;
      }
      const existsPreviousThumbName = schemaHumanoid.humanBones.leftThumbIntermediate != null || schemaHumanoid.humanBones.rightThumbIntermediate != null;
      const humanBones = {};
      if (schemaHumanoid.humanBones != null) {
        await Promise.all(
          Object.entries(schemaHumanoid.humanBones).map(async ([boneNameString, schemaHumanBone]) => {
            let boneName = boneNameString;
            const index = schemaHumanBone.node;
            if (existsPreviousThumbName) {
              const thumbBoneName = thumbBoneNameMap[boneName];
              if (thumbBoneName != null) {
                boneName = thumbBoneName;
              }
            }
            const node = await this.parser.getDependency("node", index);
            if (node == null) {
              console.warn(`A glTF node bound to the humanoid bone ${boneName} (index = ${index}) does not exist`);
              return;
            }
            humanBones[boneName] = { node };
          })
        );
      }
      const humanoid = new VRMHumanoid(this._ensureRequiredBonesExist(humanBones), {
        autoUpdateHumanBones: this.autoUpdateHumanBones
      });
      gltf.scene.add(humanoid.normalizedHumanBonesRoot);
      if (this.helperRoot) {
        const helper = new VRMHumanoidHelper(humanoid);
        this.helperRoot.add(helper);
        helper.renderOrder = this.helperRoot.renderOrder;
      }
      return humanoid;
    }
    async _v0Import(gltf) {
      const json = this.parser.json;
      const vrmExt = json.extensions?.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaHumanoid = vrmExt.humanoid;
      if (!schemaHumanoid) {
        return null;
      }
      const humanBones = {};
      if (schemaHumanoid.humanBones != null) {
        await Promise.all(
          schemaHumanoid.humanBones.map(async (bone) => {
            const boneName = bone.bone;
            const index = bone.node;
            if (boneName == null || index == null) {
              return;
            }
            if (index < 0) {
              console.warn(
                `A glTF node index for the humanoid bone ${boneName} is negative (${index}), ignoring this bone.`
              );
              return;
            }
            const node = await this.parser.getDependency("node", index);
            if (node == null) {
              console.warn(`A glTF node bound to the humanoid bone ${boneName} (index = ${index}) does not exist`);
              return;
            }
            const thumbBoneName = thumbBoneNameMap[boneName];
            const newBoneName = thumbBoneName ?? boneName;
            if (humanBones[newBoneName] != null) {
              console.warn(
                `Multiple bone entries for ${newBoneName} detected (index = ${index}), ignoring duplicated entries.`
              );
              return;
            }
            humanBones[newBoneName] = { node };
          })
        );
      }
      const humanoid = new VRMHumanoid(this._ensureRequiredBonesExist(humanBones), {
        autoUpdateHumanBones: this.autoUpdateHumanBones
      });
      gltf.scene.add(humanoid.normalizedHumanBonesRoot);
      if (this.helperRoot) {
        const helper = new VRMHumanoidHelper(humanoid);
        this.helperRoot.add(helper);
        helper.renderOrder = this.helperRoot.renderOrder;
      }
      return humanoid;
    }
    /**
     * Ensure required bones exist in given human bones.
     * @param humanBones Human bones
     * @returns Human bones, no longer partial!
     */
    _ensureRequiredBonesExist(humanBones) {
      const missingRequiredBones = Object.values(VRMRequiredHumanBoneName).filter(
        (requiredBoneName) => humanBones[requiredBoneName] == null
      );
      if (missingRequiredBones.length > 0) {
        throw new Error(
          `VRMHumanoidLoaderPlugin: These humanoid bones are required but not exist: ${missingRequiredBones.join(", ")}`
        );
      }
      return humanBones;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/helpers/utils/FanBufferGeometry.ts
  var FanBufferGeometry = class extends BufferGeometry {
    constructor() {
      super();
      this._currentTheta = 0;
      this._currentRadius = 0;
      this.theta = 0;
      this.radius = 0;
      this._currentTheta = 0;
      this._currentRadius = 0;
      this._attrPos = new BufferAttribute(new Float32Array(65 * 3), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(3 * 63), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      if (this._currentTheta !== this.theta) {
        this._currentTheta = this.theta;
        shouldUpdateGeometry = true;
      }
      if (this._currentRadius !== this.radius) {
        this._currentRadius = this.radius;
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      this._attrPos.setXYZ(0, 0, 0, 0);
      for (let i = 0; i < 64; i++) {
        const t = i / 63 * this._currentTheta;
        this._attrPos.setXYZ(i + 1, this._currentRadius * Math.sin(t), 0, this._currentRadius * Math.cos(t));
      }
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      for (let i = 0; i < 63; i++) {
        this._attrIndex.setXYZ(i * 3, 0, i + 1, i + 2);
      }
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/helpers/utils/LineAndSphereBufferGeometry.ts
  var LineAndSphereBufferGeometry = class extends BufferGeometry {
    constructor() {
      super();
      this.radius = 0;
      this._currentRadius = 0;
      this.tail = new Vector3();
      this._currentTail = new Vector3();
      this._attrPos = new BufferAttribute(new Float32Array(294), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(194), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      if (this._currentRadius !== this.radius) {
        this._currentRadius = this.radius;
        shouldUpdateGeometry = true;
      }
      if (!this._currentTail.equals(this.tail)) {
        this._currentTail.copy(this.tail);
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      for (let i = 0; i < 32; i++) {
        const t = i / 16 * Math.PI;
        this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
        this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
        this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
      }
      this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
      this.translate(this._currentTail.x, this._currentTail.y, this._currentTail.z);
      this._attrPos.setXYZ(96, 0, 0, 0);
      this._attrPos.setXYZ(97, this._currentTail.x, this._currentTail.y, this._currentTail.z);
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      for (let i = 0; i < 32; i++) {
        const i1 = (i + 1) % 32;
        this._attrIndex.setXY(i * 2, i, i1);
        this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
        this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
      }
      this._attrIndex.setXY(192, 96, 97);
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/helpers/VRMLookAtHelper.ts
  var _quatA4 = new Quaternion();
  var _quatB = new Quaternion();
  var _v3A4 = new Vector3();
  var _v3B2 = new Vector3();
  var SQRT_2_OVER_2 = Math.sqrt(2) / 2;
  var QUAT_XY_CW90 = new Quaternion(0, 0, -SQRT_2_OVER_2, SQRT_2_OVER_2);
  var VEC3_POSITIVE_Y = new Vector3(0, 1, 0);
  var VRMLookAtHelper = class extends Group {
    constructor(lookAt) {
      super();
      this.matrixAutoUpdate = false;
      this.vrmLookAt = lookAt;
      {
        const geometry = new FanBufferGeometry();
        geometry.radius = 0.5;
        const material = new MeshBasicMaterial({
          color: 65280,
          transparent: true,
          opacity: 0.5,
          side: DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        this._meshPitch = new Mesh(geometry, material);
        this.add(this._meshPitch);
      }
      {
        const geometry = new FanBufferGeometry();
        geometry.radius = 0.5;
        const material = new MeshBasicMaterial({
          color: 16711680,
          transparent: true,
          opacity: 0.5,
          side: DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        this._meshYaw = new Mesh(geometry, material);
        this.add(this._meshYaw);
      }
      {
        const geometry = new LineAndSphereBufferGeometry();
        geometry.radius = 0.1;
        const material = new LineBasicMaterial({
          color: 16777215,
          depthTest: false,
          depthWrite: false
        });
        this._lineTarget = new LineSegments(geometry, material);
        this._lineTarget.frustumCulled = false;
        this.add(this._lineTarget);
      }
    }
    dispose() {
      this._meshYaw.geometry.dispose();
      this._meshYaw.material.dispose();
      this._meshPitch.geometry.dispose();
      this._meshPitch.material.dispose();
      this._lineTarget.geometry.dispose();
      this._lineTarget.material.dispose();
    }
    updateMatrixWorld(force) {
      const yaw = MathUtils.DEG2RAD * this.vrmLookAt.yaw;
      this._meshYaw.geometry.theta = yaw;
      this._meshYaw.geometry.update();
      const pitch = MathUtils.DEG2RAD * this.vrmLookAt.pitch;
      this._meshPitch.geometry.theta = pitch;
      this._meshPitch.geometry.update();
      this.vrmLookAt.getLookAtWorldPosition(_v3A4);
      this.vrmLookAt.getLookAtWorldQuaternion(_quatA4);
      _quatA4.multiply(this.vrmLookAt.getFaceFrontQuaternion(_quatB));
      this._meshYaw.position.copy(_v3A4);
      this._meshYaw.quaternion.copy(_quatA4);
      this._meshPitch.position.copy(_v3A4);
      this._meshPitch.quaternion.copy(_quatA4);
      this._meshPitch.quaternion.multiply(_quatB.setFromAxisAngle(VEC3_POSITIVE_Y, yaw));
      this._meshPitch.quaternion.multiply(QUAT_XY_CW90);
      const { target, autoUpdate } = this.vrmLookAt;
      if (target != null && autoUpdate) {
        target.getWorldPosition(_v3B2).sub(_v3A4);
        this._lineTarget.geometry.tail.copy(_v3B2);
        this._lineTarget.geometry.update();
        this._lineTarget.position.copy(_v3A4);
      }
      super.updateMatrixWorld(force);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/utils/getWorldQuaternionLite.ts
  var _position = new Vector3();
  var _scale = new Vector3();
  function getWorldQuaternionLite(object, out) {
    object.matrixWorld.decompose(_position, out, _scale);
    return out;
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/utils/calcAzimuthAltitude.ts
  function calcAzimuthAltitude(vector) {
    return [Math.atan2(-vector.z, vector.x), Math.atan2(vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z))];
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/utils/sanitizeAngle.ts
  function sanitizeAngle(angle) {
    const roundTurn = Math.round(angle / 2 / Math.PI);
    return angle - 2 * Math.PI * roundTurn;
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAt.ts
  var VEC3_POSITIVE_Z = new Vector3(0, 0, 1);
  var _v3A5 = new Vector3();
  var _v3B3 = new Vector3();
  var _v3C = new Vector3();
  var _quatA5 = new Quaternion();
  var _quatB2 = new Quaternion();
  var _quatC = new Quaternion();
  var _quatD = new Quaternion();
  var _eulerA = new Euler();
  var _VRMLookAt = class _VRMLookAt {
    /**
     * Create a new {@link VRMLookAt}.
     *
     * @param humanoid A {@link VRMHumanoid}
     * @param applier A {@link VRMLookAtApplier}
     */
    constructor(humanoid, applier) {
      // yaw-pitch-roll
      /**
       * The origin of LookAt. Position offset from the head bone.
       */
      this.offsetFromHeadBone = new Vector3();
      /**
       * If this is true, the LookAt will be updated automatically by calling {@link update}, towarding the direction to the {@link target}.
       * `true` by default.
       *
       * See also: {@link target}
       */
      this.autoUpdate = true;
      /**
       * The front direction of the face.
       * Intended to be used for VRM 0.0 compat (VRM 0.0 models are facing Z- instead of Z+).
       * You usually don't want to touch this.
       */
      this.faceFront = new Vector3(0, 0, 1);
      this.humanoid = humanoid;
      this.applier = applier;
      this._yaw = 0;
      this._pitch = 0;
      this._needsUpdate = true;
      this._restHeadWorldQuaternion = this.getLookAtWorldQuaternion(new Quaternion());
    }
    /**
     * Its current angle around Y axis, in degree.
     */
    get yaw() {
      return this._yaw;
    }
    /**
     * Its current angle around Y axis, in degree.
     */
    set yaw(value) {
      this._yaw = value;
      this._needsUpdate = true;
    }
    /**
     * Its current angle around X axis, in degree.
     */
    get pitch() {
      return this._pitch;
    }
    /**
     * Its current angle around X axis, in degree.
     */
    set pitch(value) {
      this._pitch = value;
      this._needsUpdate = true;
    }
    /**
     * @deprecated Use {@link getEuler} instead.
     */
    get euler() {
      console.warn("VRMLookAt: euler is deprecated. use getEuler() instead.");
      return this.getEuler(new Euler());
    }
    /**
     * Get its yaw-pitch angles as an `Euler`.
     * Does NOT consider {@link faceFront}; it returns `Euler(0, 0, 0; "YXZ")` by default regardless of the faceFront value.
     *
     * @param target The target euler
     */
    getEuler(target) {
      return target.set(MathUtils.DEG2RAD * this._pitch, MathUtils.DEG2RAD * this._yaw, 0, "YXZ");
    }
    /**
     * Copy the given {@link VRMLookAt} into this one.
     * {@link humanoid} must be same as the source one.
     * {@link applier} will reference the same instance as the source one.
     * @param source The {@link VRMLookAt} you want to copy
     * @returns this
     */
    copy(source) {
      if (this.humanoid !== source.humanoid) {
        throw new Error("VRMLookAt: humanoid must be same in order to copy");
      }
      this.offsetFromHeadBone.copy(source.offsetFromHeadBone);
      this.applier = source.applier;
      this.autoUpdate = source.autoUpdate;
      this.target = source.target;
      this.faceFront.copy(source.faceFront);
      return this;
    }
    /**
     * Returns a clone of this {@link VRMLookAt}.
     * Note that {@link humanoid} and {@link applier} will reference the same instance as this one.
     * @returns Copied {@link VRMLookAt}
     */
    clone() {
      return new _VRMLookAt(this.humanoid, this.applier).copy(this);
    }
    /**
     * Reset the lookAt direction (yaw and pitch) to the initial direction.
     */
    reset() {
      this._yaw = 0;
      this._pitch = 0;
      this._needsUpdate = true;
    }
    /**
     * Get its lookAt position in world coordinate.
     *
     * @param target A target `THREE.Vector3`
     */
    getLookAtWorldPosition(target) {
      const head = this.humanoid.getRawBoneNode("head");
      return target.copy(this.offsetFromHeadBone).applyMatrix4(head.matrixWorld);
    }
    /**
     * Get its lookAt rotation in world coordinate.
     * Does NOT consider {@link faceFront}.
     *
     * @param target A target `THREE.Quaternion`
     */
    getLookAtWorldQuaternion(target) {
      const head = this.humanoid.getRawBoneNode("head");
      return getWorldQuaternionLite(head, target);
    }
    /**
     * Get a quaternion that rotates the +Z unit vector of the humanoid Head to the {@link faceFront} direction.
     *
     * @param target A target `THREE.Quaternion`
     */
    getFaceFrontQuaternion(target) {
      if (this.faceFront.distanceToSquared(VEC3_POSITIVE_Z) < 0.01) {
        return target.copy(this._restHeadWorldQuaternion).invert();
      }
      const [faceFrontAzimuth, faceFrontAltitude] = calcAzimuthAltitude(this.faceFront);
      _eulerA.set(0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude, "YZX");
      return target.setFromEuler(_eulerA).premultiply(_quatD.copy(this._restHeadWorldQuaternion).invert());
    }
    /**
     * Get its LookAt direction in world coordinate.
     *
     * @param target A target `THREE.Vector3`
     */
    getLookAtWorldDirection(target) {
      this.getLookAtWorldQuaternion(_quatB2);
      this.getFaceFrontQuaternion(_quatC);
      return target.copy(VEC3_POSITIVE_Z).applyQuaternion(_quatB2).applyQuaternion(_quatC).applyEuler(this.getEuler(_eulerA));
    }
    /**
     * Set its lookAt target position.
     *
     * Note that its result will be instantly overwritten if {@link VRMLookAtHead.autoUpdate} is enabled.
     *
     * If you want to track an object continuously, you might want to use {@link target} instead.
     *
     * @param position A target position, in world space
     */
    lookAt(position) {
      const headRotDiffInv = _quatA5.copy(this._restHeadWorldQuaternion).multiply(quatInvertCompat(this.getLookAtWorldQuaternion(_quatB2)));
      const headPos = this.getLookAtWorldPosition(_v3B3);
      const lookAtDir = _v3C.copy(position).sub(headPos).applyQuaternion(headRotDiffInv).normalize();
      const [azimuthFrom, altitudeFrom] = calcAzimuthAltitude(this.faceFront);
      const [azimuthTo, altitudeTo] = calcAzimuthAltitude(lookAtDir);
      const yaw = sanitizeAngle(azimuthTo - azimuthFrom);
      const pitch = sanitizeAngle(altitudeFrom - altitudeTo);
      this._yaw = MathUtils.RAD2DEG * yaw;
      this._pitch = MathUtils.RAD2DEG * pitch;
      this._needsUpdate = true;
    }
    /**
     * Update the VRMLookAtHead.
     * If {@link autoUpdate} is enabled, this will make it look at the {@link target}.
     *
     * @param delta deltaTime, it isn't used though. You can use the parameter if you want to use this in your own extended {@link VRMLookAt}.
     */
    update(delta) {
      if (this.target != null && this.autoUpdate) {
        this.lookAt(this.target.getWorldPosition(_v3A5));
      }
      if (this._needsUpdate) {
        this._needsUpdate = false;
        this.applier.applyYawPitch(this._yaw, this._pitch);
      }
    }
  };
  _VRMLookAt.EULER_ORDER = "YXZ";
  var VRMLookAt = _VRMLookAt;

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAtBoneApplier.ts
  var VEC3_POSITIVE_Z2 = new Vector3(0, 0, 1);
  var _quatA6 = new Quaternion();
  var _quatB3 = new Quaternion();
  var _eulerA2 = new Euler(0, 0, 0, "YXZ");
  var VRMLookAtBoneApplier = class {
    /**
     * Create a new {@link VRMLookAtBoneApplier}.
     *
     * @param humanoid A {@link VRMHumanoid}
     * @param rangeMapHorizontalInner A {@link VRMLookAtRangeMap} used for inner transverse direction
     * @param rangeMapHorizontalOuter A {@link VRMLookAtRangeMap} used for outer transverse direction
     * @param rangeMapVerticalDown A {@link VRMLookAtRangeMap} used for down direction
     * @param rangeMapVerticalUp A {@link VRMLookAtRangeMap} used for up direction
     */
    constructor(humanoid, rangeMapHorizontalInner, rangeMapHorizontalOuter, rangeMapVerticalDown, rangeMapVerticalUp) {
      this.humanoid = humanoid;
      this.rangeMapHorizontalInner = rangeMapHorizontalInner;
      this.rangeMapHorizontalOuter = rangeMapHorizontalOuter;
      this.rangeMapVerticalDown = rangeMapVerticalDown;
      this.rangeMapVerticalUp = rangeMapVerticalUp;
      this.faceFront = new Vector3(0, 0, 1);
      this._restQuatLeftEye = new Quaternion();
      this._restQuatRightEye = new Quaternion();
      this._restLeftEyeParentWorldQuat = new Quaternion();
      this._restRightEyeParentWorldQuat = new Quaternion();
      const leftEye = this.humanoid.getRawBoneNode("leftEye");
      const rightEye = this.humanoid.getRawBoneNode("rightEye");
      if (leftEye) {
        this._restQuatLeftEye.copy(leftEye.quaternion);
        getWorldQuaternionLite(leftEye.parent, this._restLeftEyeParentWorldQuat);
      }
      if (rightEye) {
        this._restQuatRightEye.copy(rightEye.quaternion);
        getWorldQuaternionLite(rightEye.parent, this._restRightEyeParentWorldQuat);
      }
    }
    /**
     * Apply the input angle to its associated VRM model.
     *
     * @param yaw Rotation around Y axis, in degree
     * @param pitch Rotation around X axis, in degree
     */
    applyYawPitch(yaw, pitch) {
      const leftEye = this.humanoid.getRawBoneNode("leftEye");
      const rightEye = this.humanoid.getRawBoneNode("rightEye");
      const leftEyeNormalized = this.humanoid.getNormalizedBoneNode("leftEye");
      const rightEyeNormalized = this.humanoid.getNormalizedBoneNode("rightEye");
      if (leftEye) {
        if (pitch < 0) {
          _eulerA2.x = -MathUtils.DEG2RAD * this.rangeMapVerticalDown.map(-pitch);
        } else {
          _eulerA2.x = MathUtils.DEG2RAD * this.rangeMapVerticalUp.map(pitch);
        }
        if (yaw < 0) {
          _eulerA2.y = -MathUtils.DEG2RAD * this.rangeMapHorizontalInner.map(-yaw);
        } else {
          _eulerA2.y = MathUtils.DEG2RAD * this.rangeMapHorizontalOuter.map(yaw);
        }
        _quatA6.setFromEuler(_eulerA2);
        this._getWorldFaceFrontQuat(_quatB3);
        leftEyeNormalized.quaternion.copy(_quatB3).multiply(_quatA6).multiply(_quatB3.invert());
        _quatA6.copy(this._restLeftEyeParentWorldQuat);
        leftEye.quaternion.copy(leftEyeNormalized.quaternion).multiply(_quatA6).premultiply(_quatA6.invert()).multiply(this._restQuatLeftEye);
      }
      if (rightEye) {
        if (pitch < 0) {
          _eulerA2.x = -MathUtils.DEG2RAD * this.rangeMapVerticalDown.map(-pitch);
        } else {
          _eulerA2.x = MathUtils.DEG2RAD * this.rangeMapVerticalUp.map(pitch);
        }
        if (yaw < 0) {
          _eulerA2.y = -MathUtils.DEG2RAD * this.rangeMapHorizontalOuter.map(-yaw);
        } else {
          _eulerA2.y = MathUtils.DEG2RAD * this.rangeMapHorizontalInner.map(yaw);
        }
        _quatA6.setFromEuler(_eulerA2);
        this._getWorldFaceFrontQuat(_quatB3);
        rightEyeNormalized.quaternion.copy(_quatB3).multiply(_quatA6).multiply(_quatB3.invert());
        _quatA6.copy(this._restRightEyeParentWorldQuat);
        rightEye.quaternion.copy(rightEyeNormalized.quaternion).multiply(_quatA6).premultiply(_quatA6.invert()).multiply(this._restQuatRightEye);
      }
    }
    /**
     * @deprecated Use {@link applyYawPitch} instead.
     */
    lookAt(euler) {
      console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");
      const yaw = MathUtils.RAD2DEG * euler.y;
      const pitch = MathUtils.RAD2DEG * euler.x;
      this.applyYawPitch(yaw, pitch);
    }
    /**
     * Get a quaternion that rotates the world-space +Z unit vector to the {@link faceFront} direction.
     *
     * @param target A target `THREE.Quaternion`
     */
    _getWorldFaceFrontQuat(target) {
      if (this.faceFront.distanceToSquared(VEC3_POSITIVE_Z2) < 0.01) {
        return target.identity();
      }
      const [faceFrontAzimuth, faceFrontAltitude] = calcAzimuthAltitude(this.faceFront);
      _eulerA2.set(0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude, "YZX");
      return target.setFromEuler(_eulerA2);
    }
  };
  /**
   * Represent its type of applier.
   */
  VRMLookAtBoneApplier.type = "bone";

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAtExpressionApplier.ts
  var VRMLookAtExpressionApplier = class {
    /**
     * Create a new {@link VRMLookAtExpressionApplier}.
     *
     * @param expressions A {@link VRMExpressionManager}
     * @param rangeMapHorizontalInner A {@link VRMLookAtRangeMap} used for inner transverse direction
     * @param rangeMapHorizontalOuter A {@link VRMLookAtRangeMap} used for outer transverse direction
     * @param rangeMapVerticalDown A {@link VRMLookAtRangeMap} used for down direction
     * @param rangeMapVerticalUp A {@link VRMLookAtRangeMap} used for up direction
     */
    constructor(expressions, rangeMapHorizontalInner, rangeMapHorizontalOuter, rangeMapVerticalDown, rangeMapVerticalUp) {
      this.expressions = expressions;
      this.rangeMapHorizontalInner = rangeMapHorizontalInner;
      this.rangeMapHorizontalOuter = rangeMapHorizontalOuter;
      this.rangeMapVerticalDown = rangeMapVerticalDown;
      this.rangeMapVerticalUp = rangeMapVerticalUp;
    }
    /**
     * Apply the input angle to its associated VRM model.
     *
     * @param yaw Rotation around Y axis, in degree
     * @param pitch Rotation around X axis, in degree
     */
    applyYawPitch(yaw, pitch) {
      if (pitch < 0) {
        this.expressions.setValue("lookDown", 0);
        this.expressions.setValue("lookUp", this.rangeMapVerticalUp.map(-pitch));
      } else {
        this.expressions.setValue("lookUp", 0);
        this.expressions.setValue("lookDown", this.rangeMapVerticalDown.map(pitch));
      }
      if (yaw < 0) {
        this.expressions.setValue("lookLeft", 0);
        this.expressions.setValue("lookRight", this.rangeMapHorizontalOuter.map(-yaw));
      } else {
        this.expressions.setValue("lookRight", 0);
        this.expressions.setValue("lookLeft", this.rangeMapHorizontalOuter.map(yaw));
      }
    }
    /**
     * @deprecated Use {@link applyYawPitch} instead.
     */
    lookAt(euler) {
      console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");
      const yaw = MathUtils.RAD2DEG * euler.y;
      const pitch = MathUtils.RAD2DEG * euler.x;
      this.applyYawPitch(yaw, pitch);
    }
  };
  /**
   * Represent its type of applier.
   */
  VRMLookAtExpressionApplier.type = "expression";

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAtRangeMap.ts
  var VRMLookAtRangeMap = class {
    /**
     * Create a new {@link VRMLookAtRangeMap}.
     *
     * @param inputMaxValue The {@link inputMaxValue} of the map
     * @param outputScale The {@link outputScale} of the map
     */
    constructor(inputMaxValue, outputScale) {
      this.inputMaxValue = inputMaxValue;
      this.outputScale = outputScale;
    }
    /**
     * Evaluate an input value and output a mapped value.
     * @param src The input value
     */
    map(src) {
      return this.outputScale * saturate(src / this.inputMaxValue);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAtLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS4 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var INPUT_MAX_VALUE_MINIMUM = 0.01;
  var VRMLookAtLoaderPlugin = class {
    get name() {
      return "VRMLookAtLoaderPlugin";
    }
    constructor(parser, options) {
      this.parser = parser;
      this.helperRoot = options?.helperRoot;
    }
    async afterRoot(gltf) {
      const vrmHumanoid = gltf.userData.vrmHumanoid;
      if (vrmHumanoid === null) {
        return;
      } else if (vrmHumanoid === void 0) {
        throw new Error("VRMLookAtLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");
      }
      const vrmExpressionManager = gltf.userData.vrmExpressionManager;
      if (vrmExpressionManager === null) {
        return;
      } else if (vrmExpressionManager === void 0) {
        throw new Error(
          "VRMLookAtLoaderPlugin: vrmExpressionManager is undefined. VRMExpressionLoaderPlugin have to be used first"
        );
      }
      gltf.userData.vrmLookAt = await this._import(gltf, vrmHumanoid, vrmExpressionManager);
    }
    /**
     * Import a {@link VRMLookAt} from a VRM.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     * @param humanoid A {@link VRMHumanoid} instance that represents the VRM
     * @param expressions A {@link VRMExpressionManager} instance that represents the VRM
     */
    async _import(gltf, humanoid, expressions) {
      if (humanoid == null || expressions == null) {
        return null;
      }
      const v1Result = await this._v1Import(gltf, humanoid, expressions);
      if (v1Result) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf, humanoid, expressions);
      if (v0Result) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf, humanoid, expressions) {
      const json = this.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRMC_vrm") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRMC_vrm"];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS4.has(specVersion)) {
        console.warn(`VRMLookAtLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaLookAt = extension.lookAt;
      if (!schemaLookAt) {
        return null;
      }
      const defaultOutputScale = schemaLookAt.type === "expression" ? 1 : 10;
      const mapHI = this._v1ImportRangeMap(schemaLookAt.rangeMapHorizontalInner, defaultOutputScale);
      const mapHO = this._v1ImportRangeMap(schemaLookAt.rangeMapHorizontalOuter, defaultOutputScale);
      const mapVD = this._v1ImportRangeMap(schemaLookAt.rangeMapVerticalDown, defaultOutputScale);
      const mapVU = this._v1ImportRangeMap(schemaLookAt.rangeMapVerticalUp, defaultOutputScale);
      let applier;
      if (schemaLookAt.type === "expression") {
        applier = new VRMLookAtExpressionApplier(expressions, mapHI, mapHO, mapVD, mapVU);
      } else {
        applier = new VRMLookAtBoneApplier(humanoid, mapHI, mapHO, mapVD, mapVU);
      }
      const lookAt = this._importLookAt(humanoid, applier);
      lookAt.offsetFromHeadBone.fromArray(schemaLookAt.offsetFromHeadBone ?? [0, 0.06, 0]);
      return lookAt;
    }
    _v1ImportRangeMap(schemaRangeMap, defaultOutputScale) {
      let inputMaxValue = schemaRangeMap?.inputMaxValue ?? 90;
      const outputScale = schemaRangeMap?.outputScale ?? defaultOutputScale;
      if (inputMaxValue < INPUT_MAX_VALUE_MINIMUM) {
        console.warn(
          "VRMLookAtLoaderPlugin: inputMaxValue of a range map is too small. Consider reviewing the range map!"
        );
        inputMaxValue = INPUT_MAX_VALUE_MINIMUM;
      }
      return new VRMLookAtRangeMap(inputMaxValue, outputScale);
    }
    async _v0Import(gltf, humanoid, expressions) {
      const json = this.parser.json;
      const vrmExt = json.extensions?.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaFirstPerson = vrmExt.firstPerson;
      if (!schemaFirstPerson) {
        return null;
      }
      const defaultOutputScale = schemaFirstPerson.lookAtTypeName === "BlendShape" ? 1 : 10;
      const mapHI = this._v0ImportDegreeMap(schemaFirstPerson.lookAtHorizontalInner, defaultOutputScale);
      const mapHO = this._v0ImportDegreeMap(schemaFirstPerson.lookAtHorizontalOuter, defaultOutputScale);
      const mapVD = this._v0ImportDegreeMap(schemaFirstPerson.lookAtVerticalDown, defaultOutputScale);
      const mapVU = this._v0ImportDegreeMap(schemaFirstPerson.lookAtVerticalUp, defaultOutputScale);
      let applier;
      if (schemaFirstPerson.lookAtTypeName === "BlendShape") {
        applier = new VRMLookAtExpressionApplier(expressions, mapHI, mapHO, mapVD, mapVU);
      } else {
        applier = new VRMLookAtBoneApplier(humanoid, mapHI, mapHO, mapVD, mapVU);
      }
      const lookAt = this._importLookAt(humanoid, applier);
      if (schemaFirstPerson.firstPersonBoneOffset) {
        lookAt.offsetFromHeadBone.set(
          schemaFirstPerson.firstPersonBoneOffset.x ?? 0,
          schemaFirstPerson.firstPersonBoneOffset.y ?? 0.06,
          -(schemaFirstPerson.firstPersonBoneOffset.z ?? 0)
        );
      } else {
        lookAt.offsetFromHeadBone.set(0, 0.06, 0);
      }
      lookAt.faceFront.set(0, 0, -1);
      if (applier instanceof VRMLookAtBoneApplier) {
        applier.faceFront.set(0, 0, -1);
      }
      return lookAt;
    }
    _v0ImportDegreeMap(schemaDegreeMap, defaultOutputScale) {
      const curve = schemaDegreeMap?.curve;
      if (JSON.stringify(curve) !== "[0,0,0,1,1,1,1,0]") {
        console.warn("Curves of LookAtDegreeMap defined in VRM 0.0 are not supported");
      }
      let xRange = schemaDegreeMap?.xRange ?? 90;
      const yRange = schemaDegreeMap?.yRange ?? defaultOutputScale;
      if (xRange < INPUT_MAX_VALUE_MINIMUM) {
        console.warn("VRMLookAtLoaderPlugin: xRange of a degree map is too small. Consider reviewing the degree map!");
        xRange = INPUT_MAX_VALUE_MINIMUM;
      }
      return new VRMLookAtRangeMap(xRange, yRange);
    }
    _importLookAt(humanoid, applier) {
      const lookAt = new VRMLookAt(humanoid, applier);
      if (this.helperRoot) {
        const helper = new VRMLookAtHelper(lookAt);
        this.helperRoot.add(helper);
        helper.renderOrder = this.helperRoot.renderOrder;
      }
      return lookAt;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/lookAt/VRMLookAtTypeName.ts
  var VRMLookAtTypeName = {
    Bone: "bone",
    Expression: "expression"
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/utils/resolveURL.ts
  function resolveURL(url, path) {
    if (typeof url !== "string" || url === "") return "";
    if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
      path = path.replace(/(^https?:\/\/[^/]+).*/i, "$1");
    }
    if (/^(https?:)?\/\//i.test(url)) return url;
    if (/^data:.*,.*$/i.test(url)) return url;
    if (/^blob:.*$/i.test(url)) return url;
    return path + url;
  }

  // ../assets_src/three-vrm/packages/three-vrm-core/src/meta/VRMMetaLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS5 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var VRMMetaLoaderPlugin = class {
    get name() {
      return "VRMMetaLoaderPlugin";
    }
    constructor(parser, options) {
      this.parser = parser;
      this.needThumbnailImage = options?.needThumbnailImage ?? false;
      this.acceptLicenseUrls = options?.acceptLicenseUrls ?? ["https://vrm.dev/licenses/1.0/"];
      this.acceptV0Meta = options?.acceptV0Meta ?? true;
    }
    async afterRoot(gltf) {
      gltf.userData.vrmMeta = await this._import(gltf);
    }
    async _import(gltf) {
      const v1Result = await this._v1Import(gltf);
      if (v1Result != null) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf);
      if (v0Result != null) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf) {
      const json = this.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRMC_vrm") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRMC_vrm"];
      if (extension == null) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS5.has(specVersion)) {
        console.warn(`VRMMetaLoaderPlugin: Unknown VRMC_vrm specVersion "${specVersion}"`);
        return null;
      }
      const schemaMeta = extension.meta;
      if (!schemaMeta) {
        return null;
      }
      const licenseUrl = schemaMeta.licenseUrl;
      const acceptLicenseUrlsSet = new Set(this.acceptLicenseUrls);
      if (!acceptLicenseUrlsSet.has(licenseUrl)) {
        throw new Error(`VRMMetaLoaderPlugin: The license url "${licenseUrl}" is not accepted`);
      }
      let thumbnailImage = void 0;
      if (this.needThumbnailImage && schemaMeta.thumbnailImage != null) {
        thumbnailImage = await this._extractGLTFImage(schemaMeta.thumbnailImage) ?? void 0;
      }
      return {
        metaVersion: "1",
        name: schemaMeta.name,
        version: schemaMeta.version,
        authors: schemaMeta.authors,
        copyrightInformation: schemaMeta.copyrightInformation,
        contactInformation: schemaMeta.contactInformation,
        references: schemaMeta.references,
        thirdPartyLicenses: schemaMeta.thirdPartyLicenses,
        thumbnailImage,
        licenseUrl: schemaMeta.licenseUrl,
        avatarPermission: schemaMeta.avatarPermission,
        allowExcessivelyViolentUsage: schemaMeta.allowExcessivelyViolentUsage,
        allowExcessivelySexualUsage: schemaMeta.allowExcessivelySexualUsage,
        commercialUsage: schemaMeta.commercialUsage,
        allowPoliticalOrReligiousUsage: schemaMeta.allowPoliticalOrReligiousUsage,
        allowAntisocialOrHateUsage: schemaMeta.allowAntisocialOrHateUsage,
        creditNotation: schemaMeta.creditNotation,
        allowRedistribution: schemaMeta.allowRedistribution,
        modification: schemaMeta.modification,
        otherLicenseUrl: schemaMeta.otherLicenseUrl
      };
    }
    async _v0Import(gltf) {
      const json = this.parser.json;
      const vrmExt = json.extensions?.VRM;
      if (!vrmExt) {
        return null;
      }
      const schemaMeta = vrmExt.meta;
      if (!schemaMeta) {
        return null;
      }
      if (!this.acceptV0Meta) {
        throw new Error("VRMMetaLoaderPlugin: Attempted to load VRM0.0 meta but acceptV0Meta is false");
      }
      let texture;
      if (this.needThumbnailImage && schemaMeta.texture != null && schemaMeta.texture !== -1) {
        texture = await this.parser.getDependency("texture", schemaMeta.texture);
      }
      return {
        metaVersion: "0",
        allowedUserName: schemaMeta.allowedUserName,
        author: schemaMeta.author,
        commercialUssageName: schemaMeta.commercialUssageName,
        contactInformation: schemaMeta.contactInformation,
        licenseName: schemaMeta.licenseName,
        otherLicenseUrl: schemaMeta.otherLicenseUrl,
        otherPermissionUrl: schemaMeta.otherPermissionUrl,
        reference: schemaMeta.reference,
        sexualUssageName: schemaMeta.sexualUssageName,
        texture: texture ?? void 0,
        title: schemaMeta.title,
        version: schemaMeta.version,
        violentUssageName: schemaMeta.violentUssageName
      };
    }
    async _extractGLTFImage(index) {
      const json = this.parser.json;
      const source = json.images?.[index];
      if (source == null) {
        console.warn(
          `VRMMetaLoaderPlugin: Attempt to use images[${index}] of glTF as a thumbnail but the image doesn't exist`
        );
        return null;
      }
      let sourceURI = source.uri;
      if (source.bufferView != null) {
        const bufferView = await this.parser.getDependency("bufferView", source.bufferView);
        const blob = new Blob([bufferView], { type: source.mimeType });
        sourceURI = URL.createObjectURL(blob);
      }
      if (sourceURI == null) {
        console.warn(
          `VRMMetaLoaderPlugin: Attempt to use images[${index}] of glTF as a thumbnail but the image couldn't load properly`
        );
        return null;
      }
      const loader = new ImageLoader();
      return await loader.loadAsync(resolveURL(sourceURI, this.parser.options.path)).catch((error2) => {
        console.error(error2);
        console.warn("VRMMetaLoaderPlugin: Failed to load a thumbnail image");
        return null;
      });
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/VRMCore.ts
  var VRMCore = class {
    /**
     * Create a new VRM instance.
     *
     * @param params {@link VRMParameters} that represents components of the VRM
     */
    constructor(params) {
      this.scene = params.scene;
      this.meta = params.meta;
      this.humanoid = params.humanoid;
      this.expressionManager = params.expressionManager;
      this.firstPerson = params.firstPerson;
      this.lookAt = params.lookAt;
    }
    /**
     * **You need to call this on your update loop.**
     *
     * This function updates every VRM components.
     *
     * @param delta deltaTime
     */
    update(delta) {
      this.humanoid.update();
      if (this.lookAt) {
        this.lookAt.update(delta);
      }
      if (this.expressionManager) {
        this.expressionManager.update();
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-core/src/VRMCoreLoaderPlugin.ts
  var VRMCoreLoaderPlugin = class {
    get name() {
      return "VRMC_vrm";
    }
    constructor(parser, options) {
      this.parser = parser;
      const helperRoot = options?.helperRoot;
      const autoUpdateHumanBones = options?.autoUpdateHumanBones;
      this.expressionPlugin = options?.expressionPlugin ?? new VRMExpressionLoaderPlugin(parser);
      this.firstPersonPlugin = options?.firstPersonPlugin ?? new VRMFirstPersonLoaderPlugin(parser);
      this.humanoidPlugin = options?.humanoidPlugin ?? new VRMHumanoidLoaderPlugin(parser, { helperRoot, autoUpdateHumanBones });
      this.lookAtPlugin = options?.lookAtPlugin ?? new VRMLookAtLoaderPlugin(parser, { helperRoot });
      this.metaPlugin = options?.metaPlugin ?? new VRMMetaLoaderPlugin(parser);
    }
    async afterRoot(gltf) {
      await this.metaPlugin.afterRoot(gltf);
      await this.humanoidPlugin.afterRoot(gltf);
      await this.expressionPlugin.afterRoot(gltf);
      await this.lookAtPlugin.afterRoot(gltf);
      await this.firstPersonPlugin.afterRoot(gltf);
      const meta = gltf.userData.vrmMeta;
      const humanoid = gltf.userData.vrmHumanoid;
      if (meta && humanoid) {
        const vrmCore = new VRMCore({
          scene: gltf.scene,
          expressionManager: gltf.userData.vrmExpressionManager,
          firstPerson: gltf.userData.vrmFirstPerson,
          humanoid,
          lookAt: gltf.userData.vrmLookAt,
          meta
        });
        gltf.userData.vrmCore = vrmCore;
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm/src/VRM.ts
  var VRM = class extends VRMCore {
    /**
     * Create a new VRM instance.
     *
     * @param params {@link VRMParameters} that represents components of the VRM
     */
    constructor(params) {
      super(params);
      this.materials = params.materials;
      this.springBoneManager = params.springBoneManager;
      this.nodeConstraintManager = params.nodeConstraintManager;
    }
    /**
     * **You need to call this on your update loop.**
     *
     * This function updates every VRM components.
     *
     * @param delta deltaTime
     */
    update(delta) {
      super.update(delta);
      if (this.nodeConstraintManager) {
        this.nodeConstraintManager.update();
      }
      if (this.springBoneManager) {
        this.springBoneManager.update(delta);
      }
      if (this.materials) {
        this.materials.forEach((material) => {
          if (material.update) {
            material.update(delta);
          }
        });
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/utils/setTextureColorSpace.ts
  var colorSpaceEncodingMap = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "": 3e3,
    srgb: 3001
  };
  function setTextureColorSpace(texture, colorSpace) {
    if (parseInt(REVISION, 10) >= 152) {
      texture.colorSpace = colorSpace;
    } else {
      texture.encoding = colorSpaceEncodingMap[colorSpace];
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/GLTFMToonMaterialParamsAssignHelper.ts
  var GLTFMToonMaterialParamsAssignHelper = class {
    get pending() {
      return Promise.all(this._pendings);
    }
    constructor(parser, materialParams) {
      this._parser = parser;
      this._materialParams = materialParams;
      this._pendings = [];
    }
    assignPrimitive(key, value) {
      if (value != null) {
        this._materialParams[key] = value;
      }
    }
    assignColor(key, value, convertSRGBToLinear) {
      if (value != null) {
        const color = new Color().fromArray(value);
        if (convertSRGBToLinear) {
          color.convertSRGBToLinear();
        }
        this._materialParams[key] = color;
      }
    }
    async assignTexture(key, schemaTexture, isColorTexture) {
      const promise = (async () => {
        if (schemaTexture != null) {
          const texture = await this._parser.assignTexture(this._materialParams, key, schemaTexture);
          if (texture == null) {
            console.warn(
              "GLTFMToonMaterialParamsAssignHelper: Failed to load texture. The rendering result may be wrong"
            );
            return;
          }
          if (isColorTexture) {
            setTextureColorSpace(texture, "srgb");
          }
        }
      })();
      this._pendings.push(promise);
      return promise;
    }
    async assignTextureByIndex(key, textureIndex, isColorTexture) {
      return this.assignTexture(key, textureIndex != null ? { index: textureIndex } : void 0, isColorTexture);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/shaders/mtoon.vert
  var mtoon_default = "// #define PHONG\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n  varying vec3 vNormal;\n#endif\n\n#include <common>\n\n// #include <uv_pars_vertex>\n#ifdef MTOON_USE_UV\n  varying vec2 vUv;\n\n  // COMPAT: pre-r151 uses a common uvTransform\n  #if THREE_VRM_THREE_REVISION < 151\n    uniform mat3 uvTransform;\n  #endif\n#endif\n\n// #include <uv2_pars_vertex>\n// COMAPT: pre-r151 uses uv2 for lightMap and aoMap\n#if THREE_VRM_THREE_REVISION < 151\n  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n    attribute vec2 uv2;\n    varying vec2 vUv2;\n    uniform mat3 uv2Transform;\n  #endif\n#endif\n\n// #include <displacementmap_pars_vertex>\n// #include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\n#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n  uniform sampler2D outlineWidthMultiplyTexture;\n  uniform mat3 outlineWidthMultiplyTextureUvTransform;\n#endif\n\nuniform float outlineWidthFactor;\n\nvoid main() {\n\n  // #include <uv_vertex>\n  #ifdef MTOON_USE_UV\n    // COMPAT: pre-r151 uses a common uvTransform\n    #if THREE_VRM_THREE_REVISION >= 151\n      vUv = uv;\n    #else\n      vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n    #endif\n  #endif\n\n  // #include <uv2_vertex>\n  // COMAPT: pre-r151 uses uv2 for lightMap and aoMap\n  #if THREE_VRM_THREE_REVISION < 151\n    #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n      vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;\n    #endif\n  #endif\n\n  #include <color_vertex>\n\n  #include <beginnormal_vertex>\n  #include <morphnormal_vertex>\n  #include <skinbase_vertex>\n  #include <skinnormal_vertex>\n\n  // we need this to compute the outline properly\n  objectNormal = normalize( objectNormal );\n\n  #include <defaultnormal_vertex>\n\n  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED\n    vNormal = normalize( transformedNormal );\n  #endif\n\n  #include <begin_vertex>\n\n  #include <morphtarget_vertex>\n  #include <skinning_vertex>\n  // #include <displacementmap_vertex>\n  #include <project_vertex>\n  #include <logdepthbuf_vertex>\n  #include <clipping_planes_vertex>\n\n  vViewPosition = - mvPosition.xyz;\n\n  #ifdef OUTLINE\n    float worldNormalLength = length( transformedNormal );\n    vec3 outlineOffset = outlineWidthFactor * worldNormalLength * objectNormal;\n\n    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;\n      float outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;\n      outlineOffset *= outlineTex;\n    #endif\n\n    #ifdef OUTLINE_WIDTH_SCREEN\n      outlineOffset *= vViewPosition.z / projectionMatrix[ 1 ].y;\n    #endif\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );\n\n    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic\n  #endif\n\n  #include <worldpos_vertex>\n  // #include <envmap_vertex>\n  #include <shadowmap_vertex>\n  #include <fog_vertex>\n\n}";

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/shaders/mtoon.frag
  var mtoon_default2 = "// #define PHONG\n\nuniform vec3 litFactor;\n\nuniform float opacity;\n\nuniform vec3 shadeColorFactor;\n#ifdef USE_SHADEMULTIPLYTEXTURE\n  uniform sampler2D shadeMultiplyTexture;\n  uniform mat3 shadeMultiplyTextureUvTransform;\n#endif\n\nuniform float shadingShiftFactor;\nuniform float shadingToonyFactor;\n\n#ifdef USE_SHADINGSHIFTTEXTURE\n  uniform sampler2D shadingShiftTexture;\n  uniform mat3 shadingShiftTextureUvTransform;\n  uniform float shadingShiftTextureScale;\n#endif\n\nuniform float giEqualizationFactor;\n\nuniform vec3 parametricRimColorFactor;\n#ifdef USE_RIMMULTIPLYTEXTURE\n  uniform sampler2D rimMultiplyTexture;\n  uniform mat3 rimMultiplyTextureUvTransform;\n#endif\nuniform float rimLightingMixFactor;\nuniform float parametricRimFresnelPowerFactor;\nuniform float parametricRimLiftFactor;\n\n#ifdef USE_MATCAPTEXTURE\n  uniform vec3 matcapFactor;\n  uniform sampler2D matcapTexture;\n  uniform mat3 matcapTextureUvTransform;\n#endif\n\nuniform vec3 emissive;\nuniform float emissiveIntensity;\n\nuniform vec3 outlineColorFactor;\nuniform float outlineLightingMixFactor;\n\n#ifdef USE_UVANIMATIONMASKTEXTURE\n  uniform sampler2D uvAnimationMaskTexture;\n  uniform mat3 uvAnimationMaskTextureUvTransform;\n#endif\n\nuniform float uvAnimationScrollXOffset;\nuniform float uvAnimationScrollYOffset;\nuniform float uvAnimationRotationPhase;\n\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n\n// #include <uv_pars_fragment>\n#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n  varying vec2 vUv;\n#endif\n\n// #include <uv2_pars_fragment>\n// COMAPT: pre-r151 uses uv2 for lightMap and aoMap\n#if THREE_VRM_THREE_REVISION < 151\n  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n    varying vec2 vUv2;\n  #endif\n#endif\n\n#include <map_pars_fragment>\n\n#ifdef USE_MAP\n  uniform mat3 mapUvTransform;\n#endif\n\n// #include <alphamap_pars_fragment>\n\n#include <alphatest_pars_fragment>\n\n#include <aomap_pars_fragment>\n// #include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n\n#ifdef USE_EMISSIVEMAP\n  uniform mat3 emissiveMapUvTransform;\n#endif\n\n// #include <envmap_common_pars_fragment>\n// #include <envmap_pars_fragment>\n// #include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n\n// #include <bsdfs>\n// COMPAT: pre-r151 doesn't have BRDF_Lambert in <common>\n#if THREE_VRM_THREE_REVISION < 151\n  vec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n    return RECIPROCAL_PI * diffuseColor;\n  }\n#endif\n\n#include <lights_pars_begin>\n\n#include <normal_pars_fragment>\n\n// #include <lights_phong_pars_fragment>\nvarying vec3 vViewPosition;\n\nstruct MToonMaterial {\n  vec3 diffuseColor;\n  vec3 shadeColor;\n  float shadingShift;\n};\n\nfloat linearstep( float a, float b, float t ) {\n  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );\n}\n\n/**\n * Convert NdotL into toon shading factor using shadingShift and shadingToony\n */\nfloat getShading(\n  const in float dotNL,\n  const in float shadow,\n  const in float shadingShift\n) {\n  float shading = dotNL;\n  shading = shading + shadingShift;\n  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );\n  shading *= shadow;\n  return shading;\n}\n\n/**\n * Mix diffuseColor and shadeColor using shading factor and light color\n */\nvec3 getDiffuse(\n  const in MToonMaterial material,\n  const in float shading,\n  in vec3 lightColor\n) {\n  #ifdef DEBUG_LITSHADERATE\n    return vec3( BRDF_Lambert( shading * lightColor ) );\n  #endif\n\n  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );\n\n  // The \"comment out if you want to PBR absolutely\" line\n  #ifdef V0_COMPAT_SHADE\n    col = min( col, material.diffuseColor );\n  #endif\n\n  return col;\n}\n\n// COMPAT: pre-r156 uses a struct GeometricContext\n#if THREE_VRM_THREE_REVISION >= 157\n  void RE_Direct_MToon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {\n    float dotNL = clamp( dot( geometryNormal, directLight.direction ), -1.0, 1.0 );\n    vec3 irradiance = directLight.color;\n\n    // directSpecular will be used for rim lighting, not an actual specular\n    reflectedLight.directSpecular += irradiance;\n\n    irradiance *= dotNL;\n\n    float shading = getShading( dotNL, shadow, material.shadingShift );\n\n    // toon shaded diffuse\n    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );\n  }\n\n  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {\n    // indirect diffuse will use diffuseColor, no shadeColor involved\n    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\n    // directSpecular will be used for rim lighting, not an actual specular\n    reflectedLight.directSpecular += irradiance;\n  }\n#else\n  void RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {\n    float dotNL = clamp( dot( geometry.normal, directLight.direction ), -1.0, 1.0 );\n    vec3 irradiance = directLight.color;\n\n    // directSpecular will be used for rim lighting, not an actual specular\n    reflectedLight.directSpecular += irradiance;\n\n    irradiance *= dotNL;\n\n    float shading = getShading( dotNL, shadow, material.shadingShift );\n\n    // toon shaded diffuse\n    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );\n  }\n\n  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {\n    // indirect diffuse will use diffuseColor, no shadeColor involved\n    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\n    // directSpecular will be used for rim lighting, not an actual specular\n    reflectedLight.directSpecular += irradiance;\n  }\n#endif\n\n#define RE_Direct RE_Direct_MToon\n#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon\n#define Material_LightProbeLOD( material ) (0)\n\n#include <shadowmap_pars_fragment>\n// #include <bumpmap_pars_fragment>\n\n// #include <normalmap_pars_fragment>\n#ifdef USE_NORMALMAP\n\n  uniform sampler2D normalMap;\n  uniform mat3 normalMapUvTransform;\n  uniform vec2 normalScale;\n\n#endif\n\n// COMPAT: pre-r151\n// USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151\n#if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )\n\n  uniform mat3 normalMatrix;\n\n#endif\n\n// COMPAT: pre-r151\n// USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( TANGENTSPACE_NORMALMAP ) )\n\n  // Per-Pixel Tangent Space Normal Mapping\n  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\n\n  // three-vrm specific change: it requires `uv` as an input in order to support uv scrolls\n\n  // Temporary compat against shader change @ Three.js r126, r151\n  #if THREE_VRM_THREE_REVISION >= 151\n\n    mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n\n      vec3 q0 = dFdx( eye_pos.xyz );\n      vec3 q1 = dFdy( eye_pos.xyz );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      vec3 N = surf_norm;\n\n      vec3 q1perp = cross( q1, N );\n      vec3 q0perp = cross( N, q0 );\n\n      vec3 T = q1perp * st0.x + q0perp * st1.x;\n      vec3 B = q1perp * st0.y + q0perp * st1.y;\n\n      float det = max( dot( T, T ), dot( B, B ) );\n      float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n\n      return mat3( T * scale, B * scale, N );\n\n    }\n\n  #else\n\n    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {\n\n      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      vec3 N = normalize( surf_norm );\n\n      vec3 q1perp = cross( q1, N );\n      vec3 q0perp = cross( N, q0 );\n\n      vec3 T = q1perp * st0.x + q0perp * st1.x;\n      vec3 B = q1perp * st0.y + q0perp * st1.y;\n\n      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0\n      // TODO: Is this still required? Or shall I make a PR about it?\n      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {\n        return surf_norm;\n      }\n\n      float det = max( dot( T, T ), dot( B, B ) );\n      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );\n\n      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );\n\n    }\n\n  #endif\n\n#endif\n\n// #include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\n// == post correction ==========================================================\nvoid postCorrection() {\n  #include <tonemapping_fragment>\n  #include <colorspace_fragment>\n  #include <fog_fragment>\n  #include <premultiplied_alpha_fragment>\n  #include <dithering_fragment>\n}\n\n// == main procedure ===========================================================\nvoid main() {\n  #include <clipping_planes_fragment>\n\n  vec2 uv = vec2(0.5, 0.5);\n\n  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n    uv = vUv;\n\n    float uvAnimMask = 1.0;\n    #ifdef USE_UVANIMATIONMASKTEXTURE\n      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;\n      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;\n    #endif\n\n    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );\n    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );\n    uv = mat2( uvRotCos, -uvRotSin, uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;\n    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;\n  #endif\n\n  #ifdef DEBUG_UV\n    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n      gl_FragColor = vec4( uv, 0.0, 1.0 );\n    #endif\n    return;\n  #endif\n\n  vec4 diffuseColor = vec4( litFactor, opacity );\n  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;\n\n  #include <logdepthbuf_fragment>\n\n  // #include <map_fragment>\n  #ifdef USE_MAP\n    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;\n    vec4 sampledDiffuseColor = texture2D( map, mapUv );\n    #ifdef DECODE_VIDEO_TEXTURE\n      sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );\n    #endif\n    diffuseColor *= sampledDiffuseColor;\n  #endif\n\n  // #include <color_fragment>\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    diffuseColor.rgb *= vColor;\n  #endif\n\n  // #include <alphamap_fragment>\n\n  #include <alphatest_fragment>\n\n  // #include <specularmap_fragment>\n\n  // #include <normal_fragment_begin>\n  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;\n\n  #ifdef FLAT_SHADED\n\n    vec3 fdx = dFdx( vViewPosition );\n    vec3 fdy = dFdy( vViewPosition );\n    vec3 normal = normalize( cross( fdx, fdy ) );\n\n  #else\n\n    vec3 normal = normalize( vNormal );\n\n    #ifdef DOUBLE_SIDED\n\n      normal *= faceDirection;\n\n    #endif\n\n  #endif\n\n  #ifdef USE_NORMALMAP\n\n    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;\n\n  #endif\n\n  #ifdef USE_NORMALMAP_TANGENTSPACE\n\n    #ifdef USE_TANGENT\n\n      mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n\n    #else\n\n      mat3 tbn = getTangentFrame( - vViewPosition, normal, normalMapUv );\n\n    #endif\n\n    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n\n      tbn[0] *= faceDirection;\n      tbn[1] *= faceDirection;\n\n    #endif\n\n  #endif\n\n  #ifdef USE_CLEARCOAT_NORMALMAP\n\n    #ifdef USE_TANGENT\n\n      mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n\n    #else\n\n      mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n\n    #endif\n\n    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n\n      tbn2[0] *= faceDirection;\n      tbn2[1] *= faceDirection;\n\n    #endif\n\n  #endif\n\n  // non perturbed normal for clearcoat among others\n\n  vec3 nonPerturbedNormal = normal;\n\n  #ifdef OUTLINE\n    normal *= -1.0;\n  #endif\n\n  // #include <normal_fragment_maps>\n\n  // COMPAT: pre-r151\n  // USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151\n  #if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )\n\n    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals\n\n    #ifdef FLIP_SIDED\n\n      normal = - normal;\n\n    #endif\n\n    #ifdef DOUBLE_SIDED\n\n      normal = normal * faceDirection;\n\n    #endif\n\n    normal = normalize( normalMatrix * normal );\n\n  // COMPAT: pre-r151\n  // USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151\n  #elif defined( USE_NORMALMAP_TANGENTSPACE ) || defined( TANGENTSPACE_NORMALMAP )\n\n    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;\n    mapN.xy *= normalScale;\n\n    // COMPAT: pre-r151\n    #if THREE_VRM_THREE_REVISION >= 151 || defined( USE_TANGENT )\n\n      normal = normalize( tbn * mapN );\n\n    #else\n\n      normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );\n\n    #endif\n\n  #endif\n\n  // #include <emissivemap_fragment>\n  #ifdef USE_EMISSIVEMAP\n    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;\n    totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;\n  #endif\n\n  #ifdef DEBUG_NORMAL\n    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );\n    return;\n  #endif\n\n  // -- MToon: lighting --------------------------------------------------------\n  // accumulation\n  // #include <lights_phong_fragment>\n  MToonMaterial material;\n\n  material.diffuseColor = diffuseColor.rgb;\n\n  material.shadeColor = shadeColorFactor;\n  #ifdef USE_SHADEMULTIPLYTEXTURE\n    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;\n  #endif\n\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    material.shadeColor.rgb *= vColor;\n  #endif\n\n  material.shadingShift = shadingShiftFactor;\n  #ifdef USE_SHADINGSHIFTTEXTURE\n    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;\n    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;\n  #endif\n\n  // #include <lights_fragment_begin>\n\n  // MToon Specific changes:\n  // Since we want to take shadows into account of shading instead of irradiance,\n  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.\n\n  // COMPAT: pre-r156 uses a struct GeometricContext\n  #if THREE_VRM_THREE_REVISION >= 157\n    vec3 geometryPosition = - vViewPosition;\n    vec3 geometryNormal = normal;\n    vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n\n    vec3 geometryClearcoatNormal;\n\n    #ifdef USE_CLEARCOAT\n\n      geometryClearcoatNormal = clearcoatNormal;\n\n    #endif\n  #else\n    GeometricContext geometry;\n\n    geometry.position = - vViewPosition;\n    geometry.normal = normal;\n    geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n\n    #ifdef USE_CLEARCOAT\n\n      geometry.clearcoatNormal = clearcoatNormal;\n\n    #endif\n  #endif\n\n  IncidentLight directLight;\n\n  // since these variables will be used in unrolled loop, we have to define in prior\n  float shadow;\n\n  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    PointLight pointLight;\n    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n    PointLightShadow pointLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\n      pointLight = pointLights[ i ];\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        getPointLightInfo( pointLight, geometryPosition, directLight );\n      #else\n        getPointLightInfo( pointLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n      pointLightShadow = pointLightShadows[ i ];\n      // COMPAT: pre-r166\n      // r166 introduced shadowIntensity\n      #if THREE_VRM_THREE_REVISION >= 166\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n      #else\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n      #endif\n      #endif\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );\n      #else\n        RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n      #endif\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    SpotLight spotLight;\n    // COMPAT: pre-r144 uses NUM_SPOT_LIGHT_SHADOWS, r144+ uses NUM_SPOT_LIGHT_COORDS\n    #if THREE_VRM_THREE_REVISION >= 144\n      #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_COORDS > 0\n      SpotLightShadow spotLightShadow;\n      #endif\n    #elif defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n    SpotLightShadow spotLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\n      spotLight = spotLights[ i ];\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        getSpotLightInfo( spotLight, geometryPosition, directLight );\n      #else\n        getSpotLightInfo( spotLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      // COMPAT: pre-r144 uses NUM_SPOT_LIGHT_SHADOWS and vSpotShadowCoord, r144+ uses NUM_SPOT_LIGHT_COORDS and vSpotLightCoord\n      // COMPAT: pre-r166 does not have shadowIntensity, r166+ has shadowIntensity\n      #if THREE_VRM_THREE_REVISION >= 166\n        #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_COORDS )\n        spotLightShadow = spotLightShadows[ i ];\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n        #endif\n      #elif THREE_VRM_THREE_REVISION >= 144\n        #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_COORDS )\n        spotLightShadow = spotLightShadows[ i ];\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n        #endif\n      #elif defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n      spotLightShadow = spotLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n      #endif\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );\n      #else\n        RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n      #endif\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\n    DirectionalLight directionalLight;\n    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n    DirectionalLightShadow directionalLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\n      directionalLight = directionalLights[ i ];\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        getDirectionalLightInfo( directionalLight, directLight );\n      #else\n        getDirectionalLightInfo( directionalLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n      directionalLightShadow = directionalLightShadows[ i ];\n      // COMPAT: pre-r166\n      // r166 introduced shadowIntensity\n      #if THREE_VRM_THREE_REVISION >= 166\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n      #else\n        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n      #endif\n      #endif\n\n      // COMPAT: pre-r156 uses a struct GeometricContext\n      #if THREE_VRM_THREE_REVISION >= 157\n        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );\n      #else\n        RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n      #endif\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\n  //   RectAreaLight rectAreaLight;\n\n  //   #pragma unroll_loop_start\n  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\n  //     rectAreaLight = rectAreaLights[ i ];\n  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\n  //   }\n  //   #pragma unroll_loop_end\n\n  // #endif\n\n  #if defined( RE_IndirectDiffuse )\n\n    vec3 iblIrradiance = vec3( 0.0 );\n\n    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\n    // COMPAT: pre-r156 uses a struct GeometricContext\n    // COMPAT: pre-r156 doesn't have a define USE_LIGHT_PROBES\n    #if THREE_VRM_THREE_REVISION >= 157\n      #if defined( USE_LIGHT_PROBES )\n        irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );\n      #endif\n    #else\n      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );\n    #endif\n\n    #if ( NUM_HEMI_LIGHTS > 0 )\n\n      #pragma unroll_loop_start\n      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\n        // COMPAT: pre-r156 uses a struct GeometricContext\n        #if THREE_VRM_THREE_REVISION >= 157\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );\n        #else\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n        #endif\n\n      }\n      #pragma unroll_loop_end\n\n    #endif\n\n  #endif\n\n  // #if defined( RE_IndirectSpecular )\n\n  //   vec3 radiance = vec3( 0.0 );\n  //   vec3 clearcoatRadiance = vec3( 0.0 );\n\n  // #endif\n\n  #include <lights_fragment_maps>\n  #include <lights_fragment_end>\n\n  // modulation\n  #include <aomap_fragment>\n\n  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\n  #ifdef DEBUG_LITSHADERATE\n    gl_FragColor = vec4( col, diffuseColor.a );\n    postCorrection();\n    return;\n  #endif\n\n  // -- MToon: rim lighting -----------------------------------------\n  vec3 viewDir = normalize( vViewPosition );\n\n  #ifndef PHYSICALLY_CORRECT_LIGHTS\n    reflectedLight.directSpecular /= PI;\n  #endif\n  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, rimLightingMixFactor );\n\n  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );\n\n  #ifdef USE_MATCAPTEXTURE\n    {\n      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );\n      vec3 y = cross( viewDir, x ); // guaranteed to be normalized\n      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );\n      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;\n      vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;\n      rim += matcapFactor * matcap;\n    }\n  #endif\n\n  #ifdef USE_RIMMULTIPLYTEXTURE\n    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;\n  #endif\n\n  col += rimMix * rim;\n\n  // -- MToon: Emission --------------------------------------------------------\n  col += totalEmissiveRadiance;\n\n  // #include <envmap_fragment>\n\n  // -- Almost done! -----------------------------------------------------------\n  #if defined( OUTLINE )\n    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );\n  #endif\n\n  #ifdef OPAQUE\n    diffuseColor.a = 1.0;\n  #endif\n\n  gl_FragColor = vec4( col, diffuseColor.a );\n  postCorrection();\n}\n";

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/MToonMaterialDebugMode.ts
  var MToonMaterialDebugMode = {
    /**
     * Render normally.
     */
    None: "none",
    /**
     * Visualize normals of the surface.
     */
    Normal: "normal",
    /**
     * Visualize lit/shade of the surface.
     */
    LitShadeRate: "litShadeRate",
    /**
     * Visualize UV of the surface.
     */
    UV: "uv"
  };

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/MToonMaterialOutlineWidthMode.ts
  var MToonMaterialOutlineWidthMode = {
    None: "none",
    WorldCoordinates: "worldCoordinates",
    ScreenCoordinates: "screenCoordinates"
  };

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/utils/getTextureColorSpace.ts
  var encodingColorSpaceMap = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    3e3: "",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    3001: "srgb"
  };
  function getTextureColorSpace(texture) {
    if (parseInt(REVISION, 10) >= 152) {
      return texture.colorSpace;
    } else {
      return encodingColorSpaceMap[texture.encoding];
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/MToonMaterial.ts
  var MToonMaterial = class extends ShaderMaterial {
    constructor(parameters = {}) {
      super({ vertexShader: mtoon_default, fragmentShader: mtoon_default2 });
      this.uvAnimationScrollXSpeedFactor = 0;
      this.uvAnimationScrollYSpeedFactor = 0;
      this.uvAnimationRotationSpeedFactor = 0;
      /**
       * Whether the material is affected by fog.
       * `true` by default.
       */
      this.fog = true;
      /**
       * Will be read in WebGLPrograms
       *
       * See: https://github.com/mrdoob/three.js/blob/4f5236ac3d6f41d904aa58401b40554e8fbdcb15/src/renderers/webgl/WebGLPrograms.js#L190-L191
       */
      this.normalMapType = TangentSpaceNormalMap;
      /**
       * When this is `true`, vertex colors will be ignored.
       * `true` by default.
       */
      this._ignoreVertexColor = true;
      this._v0CompatShade = false;
      this._debugMode = MToonMaterialDebugMode.None;
      this._outlineWidthMode = MToonMaterialOutlineWidthMode.None;
      this._isOutline = false;
      if (parameters.transparentWithZWrite) {
        parameters.depthWrite = true;
      }
      delete parameters.transparentWithZWrite;
      parameters.fog = true;
      parameters.lights = true;
      parameters.clipping = true;
      this.uniforms = UniformsUtils.merge([
        UniformsLib.common,
        // map
        UniformsLib.normalmap,
        // normalMap
        UniformsLib.emissivemap,
        // emissiveMap
        UniformsLib.fog,
        UniformsLib.lights,
        {
          litFactor: { value: new Color(1, 1, 1) },
          mapUvTransform: { value: new Matrix3() },
          colorAlpha: { value: 1 },
          normalMapUvTransform: { value: new Matrix3() },
          shadeColorFactor: { value: new Color(0, 0, 0) },
          shadeMultiplyTexture: { value: null },
          shadeMultiplyTextureUvTransform: { value: new Matrix3() },
          shadingShiftFactor: { value: 0 },
          shadingShiftTexture: { value: null },
          shadingShiftTextureUvTransform: { value: new Matrix3() },
          shadingShiftTextureScale: { value: 1 },
          shadingToonyFactor: { value: 0.9 },
          giEqualizationFactor: { value: 0.9 },
          matcapFactor: { value: new Color(1, 1, 1) },
          matcapTexture: { value: null },
          matcapTextureUvTransform: { value: new Matrix3() },
          parametricRimColorFactor: { value: new Color(0, 0, 0) },
          rimMultiplyTexture: { value: null },
          rimMultiplyTextureUvTransform: { value: new Matrix3() },
          rimLightingMixFactor: { value: 1 },
          parametricRimFresnelPowerFactor: { value: 5 },
          parametricRimLiftFactor: { value: 0 },
          emissive: { value: new Color(0, 0, 0) },
          emissiveIntensity: { value: 1 },
          emissiveMapUvTransform: { value: new Matrix3() },
          outlineWidthMultiplyTexture: { value: null },
          outlineWidthMultiplyTextureUvTransform: { value: new Matrix3() },
          outlineWidthFactor: { value: 0 },
          outlineColorFactor: { value: new Color(0, 0, 0) },
          outlineLightingMixFactor: { value: 1 },
          uvAnimationMaskTexture: { value: null },
          uvAnimationMaskTextureUvTransform: { value: new Matrix3() },
          uvAnimationScrollXOffset: { value: 0 },
          uvAnimationScrollYOffset: { value: 0 },
          uvAnimationRotationPhase: { value: 0 }
        },
        parameters.uniforms ?? {}
      ]);
      this.setValues(parameters);
      this._uploadUniformsWorkaround();
      this.customProgramCacheKey = () => [
        ...Object.entries(this._generateDefines()).map(([token, macro]) => `${token}:${macro}`),
        this.matcapTexture ? `matcapTextureColorSpace:${getTextureColorSpace(this.matcapTexture)}` : "",
        this.shadeMultiplyTexture ? `shadeMultiplyTextureColorSpace:${getTextureColorSpace(this.shadeMultiplyTexture)}` : "",
        this.rimMultiplyTexture ? `rimMultiplyTextureColorSpace:${getTextureColorSpace(this.rimMultiplyTexture)}` : ""
      ].join(",");
      this.onBeforeCompile = (shader) => {
        const threeRevision = parseInt(REVISION, 10);
        const defines = Object.entries({ ...this._generateDefines(), ...this.defines }).filter(([token, macro]) => !!macro).map(([token, macro]) => `#define ${token} ${macro}`).join("\n") + "\n";
        shader.vertexShader = defines + shader.vertexShader;
        shader.fragmentShader = defines + shader.fragmentShader;
        if (threeRevision < 154) {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <colorspace_fragment>",
            "#include <encodings_fragment>"
          );
        }
      };
    }
    get color() {
      return this.uniforms.litFactor.value;
    }
    set color(value) {
      this.uniforms.litFactor.value = value;
    }
    get map() {
      return this.uniforms.map.value;
    }
    set map(value) {
      this.uniforms.map.value = value;
    }
    get normalMap() {
      return this.uniforms.normalMap.value;
    }
    set normalMap(value) {
      this.uniforms.normalMap.value = value;
    }
    get normalScale() {
      return this.uniforms.normalScale.value;
    }
    set normalScale(value) {
      this.uniforms.normalScale.value = value;
    }
    get emissive() {
      return this.uniforms.emissive.value;
    }
    set emissive(value) {
      this.uniforms.emissive.value = value;
    }
    get emissiveIntensity() {
      return this.uniforms.emissiveIntensity.value;
    }
    set emissiveIntensity(value) {
      this.uniforms.emissiveIntensity.value = value;
    }
    get emissiveMap() {
      return this.uniforms.emissiveMap.value;
    }
    set emissiveMap(value) {
      this.uniforms.emissiveMap.value = value;
    }
    get shadeColorFactor() {
      return this.uniforms.shadeColorFactor.value;
    }
    set shadeColorFactor(value) {
      this.uniforms.shadeColorFactor.value = value;
    }
    get shadeMultiplyTexture() {
      return this.uniforms.shadeMultiplyTexture.value;
    }
    set shadeMultiplyTexture(value) {
      this.uniforms.shadeMultiplyTexture.value = value;
    }
    get shadingShiftFactor() {
      return this.uniforms.shadingShiftFactor.value;
    }
    set shadingShiftFactor(value) {
      this.uniforms.shadingShiftFactor.value = value;
    }
    get shadingShiftTexture() {
      return this.uniforms.shadingShiftTexture.value;
    }
    set shadingShiftTexture(value) {
      this.uniforms.shadingShiftTexture.value = value;
    }
    get shadingShiftTextureScale() {
      return this.uniforms.shadingShiftTextureScale.value;
    }
    set shadingShiftTextureScale(value) {
      this.uniforms.shadingShiftTextureScale.value = value;
    }
    get shadingToonyFactor() {
      return this.uniforms.shadingToonyFactor.value;
    }
    set shadingToonyFactor(value) {
      this.uniforms.shadingToonyFactor.value = value;
    }
    get giEqualizationFactor() {
      return this.uniforms.giEqualizationFactor.value;
    }
    set giEqualizationFactor(value) {
      this.uniforms.giEqualizationFactor.value = value;
    }
    get matcapFactor() {
      return this.uniforms.matcapFactor.value;
    }
    set matcapFactor(value) {
      this.uniforms.matcapFactor.value = value;
    }
    get matcapTexture() {
      return this.uniforms.matcapTexture.value;
    }
    set matcapTexture(value) {
      this.uniforms.matcapTexture.value = value;
    }
    get parametricRimColorFactor() {
      return this.uniforms.parametricRimColorFactor.value;
    }
    set parametricRimColorFactor(value) {
      this.uniforms.parametricRimColorFactor.value = value;
    }
    get rimMultiplyTexture() {
      return this.uniforms.rimMultiplyTexture.value;
    }
    set rimMultiplyTexture(value) {
      this.uniforms.rimMultiplyTexture.value = value;
    }
    get rimLightingMixFactor() {
      return this.uniforms.rimLightingMixFactor.value;
    }
    set rimLightingMixFactor(value) {
      this.uniforms.rimLightingMixFactor.value = value;
    }
    get parametricRimFresnelPowerFactor() {
      return this.uniforms.parametricRimFresnelPowerFactor.value;
    }
    set parametricRimFresnelPowerFactor(value) {
      this.uniforms.parametricRimFresnelPowerFactor.value = value;
    }
    get parametricRimLiftFactor() {
      return this.uniforms.parametricRimLiftFactor.value;
    }
    set parametricRimLiftFactor(value) {
      this.uniforms.parametricRimLiftFactor.value = value;
    }
    get outlineWidthMultiplyTexture() {
      return this.uniforms.outlineWidthMultiplyTexture.value;
    }
    set outlineWidthMultiplyTexture(value) {
      this.uniforms.outlineWidthMultiplyTexture.value = value;
    }
    get outlineWidthFactor() {
      return this.uniforms.outlineWidthFactor.value;
    }
    set outlineWidthFactor(value) {
      this.uniforms.outlineWidthFactor.value = value;
    }
    get outlineColorFactor() {
      return this.uniforms.outlineColorFactor.value;
    }
    set outlineColorFactor(value) {
      this.uniforms.outlineColorFactor.value = value;
    }
    get outlineLightingMixFactor() {
      return this.uniforms.outlineLightingMixFactor.value;
    }
    set outlineLightingMixFactor(value) {
      this.uniforms.outlineLightingMixFactor.value = value;
    }
    get uvAnimationMaskTexture() {
      return this.uniforms.uvAnimationMaskTexture.value;
    }
    set uvAnimationMaskTexture(value) {
      this.uniforms.uvAnimationMaskTexture.value = value;
    }
    get uvAnimationScrollXOffset() {
      return this.uniforms.uvAnimationScrollXOffset.value;
    }
    set uvAnimationScrollXOffset(value) {
      this.uniforms.uvAnimationScrollXOffset.value = value;
    }
    get uvAnimationScrollYOffset() {
      return this.uniforms.uvAnimationScrollYOffset.value;
    }
    set uvAnimationScrollYOffset(value) {
      this.uniforms.uvAnimationScrollYOffset.value = value;
    }
    get uvAnimationRotationPhase() {
      return this.uniforms.uvAnimationRotationPhase.value;
    }
    set uvAnimationRotationPhase(value) {
      this.uniforms.uvAnimationRotationPhase.value = value;
    }
    /**
     * When this is `true`, vertex colors will be ignored.
     * `true` by default.
     */
    get ignoreVertexColor() {
      return this._ignoreVertexColor;
    }
    set ignoreVertexColor(value) {
      this._ignoreVertexColor = value;
      this.needsUpdate = true;
    }
    /**
     * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
     * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
     * Usually not recommended to turn this on.
     * `false` by default.
     */
    get v0CompatShade() {
      return this._v0CompatShade;
    }
    /**
     * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
     * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
     * Usually not recommended to turn this on.
     * `false` by default.
     */
    set v0CompatShade(v) {
      this._v0CompatShade = v;
      this.needsUpdate = true;
    }
    /**
     * Debug mode for the material.
     * You can visualize several components for diagnosis using debug mode.
     *
     * See: {@link MToonMaterialDebugMode}
     */
    get debugMode() {
      return this._debugMode;
    }
    /**
     * Debug mode for the material.
     * You can visualize several components for diagnosis using debug mode.
     *
     * See: {@link MToonMaterialDebugMode}
     */
    set debugMode(m) {
      this._debugMode = m;
      this.needsUpdate = true;
    }
    get outlineWidthMode() {
      return this._outlineWidthMode;
    }
    set outlineWidthMode(m) {
      this._outlineWidthMode = m;
      this.needsUpdate = true;
    }
    get isOutline() {
      return this._isOutline;
    }
    set isOutline(b) {
      this._isOutline = b;
      this.needsUpdate = true;
    }
    /**
     * Readonly boolean that indicates this is a {@link MToonMaterial}.
     */
    get isMToonMaterial() {
      return true;
    }
    /**
     * Update this material.
     *
     * @param delta deltaTime since last update
     */
    update(delta) {
      this._uploadUniformsWorkaround();
      this._updateUVAnimation(delta);
    }
    copy(source) {
      super.copy(source);
      this.map = source.map;
      this.normalMap = source.normalMap;
      this.emissiveMap = source.emissiveMap;
      this.shadeMultiplyTexture = source.shadeMultiplyTexture;
      this.shadingShiftTexture = source.shadingShiftTexture;
      this.matcapTexture = source.matcapTexture;
      this.rimMultiplyTexture = source.rimMultiplyTexture;
      this.outlineWidthMultiplyTexture = source.outlineWidthMultiplyTexture;
      this.uvAnimationMaskTexture = source.uvAnimationMaskTexture;
      this.normalMapType = source.normalMapType;
      this.uvAnimationScrollXSpeedFactor = source.uvAnimationScrollXSpeedFactor;
      this.uvAnimationScrollYSpeedFactor = source.uvAnimationScrollYSpeedFactor;
      this.uvAnimationRotationSpeedFactor = source.uvAnimationRotationSpeedFactor;
      this.ignoreVertexColor = source.ignoreVertexColor;
      this.v0CompatShade = source.v0CompatShade;
      this.debugMode = source.debugMode;
      this.outlineWidthMode = source.outlineWidthMode;
      this.isOutline = source.isOutline;
      this.needsUpdate = true;
      return this;
    }
    /**
     * Update UV animation state.
     * Intended to be called via {@link update}.
     * @param delta deltaTime
     */
    _updateUVAnimation(delta) {
      this.uniforms.uvAnimationScrollXOffset.value += delta * this.uvAnimationScrollXSpeedFactor;
      this.uniforms.uvAnimationScrollYOffset.value += delta * this.uvAnimationScrollYSpeedFactor;
      this.uniforms.uvAnimationRotationPhase.value += delta * this.uvAnimationRotationSpeedFactor;
      this.uniforms.alphaTest.value = this.alphaTest;
      this.uniformsNeedUpdate = true;
    }
    /**
     * Upload uniforms that need to upload but doesn't automatically because of reasons.
     * Intended to be called via {@link constructor} and {@link update}.
     */
    _uploadUniformsWorkaround() {
      this.uniforms.opacity.value = this.opacity;
      this._updateTextureMatrix(this.uniforms.map, this.uniforms.mapUvTransform);
      this._updateTextureMatrix(this.uniforms.normalMap, this.uniforms.normalMapUvTransform);
      this._updateTextureMatrix(this.uniforms.emissiveMap, this.uniforms.emissiveMapUvTransform);
      this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture, this.uniforms.shadeMultiplyTextureUvTransform);
      this._updateTextureMatrix(this.uniforms.shadingShiftTexture, this.uniforms.shadingShiftTextureUvTransform);
      this._updateTextureMatrix(this.uniforms.matcapTexture, this.uniforms.matcapTextureUvTransform);
      this._updateTextureMatrix(this.uniforms.rimMultiplyTexture, this.uniforms.rimMultiplyTextureUvTransform);
      this._updateTextureMatrix(
        this.uniforms.outlineWidthMultiplyTexture,
        this.uniforms.outlineWidthMultiplyTextureUvTransform
      );
      this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture, this.uniforms.uvAnimationMaskTextureUvTransform);
      this.uniformsNeedUpdate = true;
    }
    /**
     * Returns a map object of preprocessor token and macro of the shader program.
     */
    _generateDefines() {
      const threeRevision = parseInt(REVISION, 10);
      const useUvInVert = this.outlineWidthMultiplyTexture !== null;
      const useUvInFrag = this.map !== null || this.normalMap !== null || this.emissiveMap !== null || this.shadeMultiplyTexture !== null || this.shadingShiftTexture !== null || this.rimMultiplyTexture !== null || this.uvAnimationMaskTexture !== null;
      return {
        // Temporary compat against shader change @ Three.js r126
        // See: #21205, #21307, #21299
        THREE_VRM_THREE_REVISION: threeRevision,
        OUTLINE: this._isOutline,
        MTOON_USE_UV: useUvInVert || useUvInFrag,
        // we can't use `USE_UV` , it will be redefined in WebGLProgram.js
        MTOON_UVS_VERTEX_ONLY: useUvInVert && !useUvInFrag,
        V0_COMPAT_SHADE: this._v0CompatShade,
        USE_SHADEMULTIPLYTEXTURE: this.shadeMultiplyTexture !== null,
        USE_SHADINGSHIFTTEXTURE: this.shadingShiftTexture !== null,
        USE_MATCAPTEXTURE: this.matcapTexture !== null,
        USE_RIMMULTIPLYTEXTURE: this.rimMultiplyTexture !== null,
        USE_OUTLINEWIDTHMULTIPLYTEXTURE: this._isOutline && this.outlineWidthMultiplyTexture !== null,
        USE_UVANIMATIONMASKTEXTURE: this.uvAnimationMaskTexture !== null,
        IGNORE_VERTEX_COLOR: this._ignoreVertexColor === true,
        DEBUG_NORMAL: this._debugMode === "normal",
        DEBUG_LITSHADERATE: this._debugMode === "litShadeRate",
        DEBUG_UV: this._debugMode === "uv",
        OUTLINE_WIDTH_SCREEN: this._isOutline && this._outlineWidthMode === MToonMaterialOutlineWidthMode.ScreenCoordinates
      };
    }
    _updateTextureMatrix(src, dst) {
      if (src.value) {
        if (src.value.matrixAutoUpdate) {
          src.value.updateMatrix();
        }
        dst.value.copy(src.value.matrix);
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-materials-mtoon/src/MToonMaterialLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS6 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var _MToonMaterialLoaderPlugin = class _MToonMaterialLoaderPlugin {
    get name() {
      return _MToonMaterialLoaderPlugin.EXTENSION_NAME;
    }
    constructor(parser, options = {}) {
      this.parser = parser;
      this.materialType = options.materialType ?? MToonMaterial;
      this.renderOrderOffset = options.renderOrderOffset ?? 0;
      this.v0CompatShade = options.v0CompatShade ?? false;
      this.debugMode = options.debugMode ?? "none";
      this._mToonMaterialSet = /* @__PURE__ */ new Set();
    }
    async beforeRoot() {
      this._removeUnlitExtensionIfMToonExists();
    }
    async afterRoot(gltf) {
      gltf.userData.vrmMToonMaterials = Array.from(this._mToonMaterialSet);
    }
    getMaterialType(materialIndex) {
      const v1Extension = this._getMToonExtension(materialIndex);
      if (v1Extension) {
        return this.materialType;
      }
      return null;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const extension = this._getMToonExtension(materialIndex);
      if (extension) {
        return this._extendMaterialParams(extension, materialParams);
      }
      return null;
    }
    async loadMesh(meshIndex) {
      const parser = this.parser;
      const json = parser.json;
      const meshDef = json.meshes?.[meshIndex];
      if (meshDef == null) {
        throw new Error(
          `MToonMaterialLoaderPlugin: Attempt to use meshes[${meshIndex}] of glTF but the mesh doesn't exist`
        );
      }
      const primitivesDef = meshDef.primitives;
      const meshOrGroup = await parser.loadMesh(meshIndex);
      if (primitivesDef.length === 1) {
        const mesh = meshOrGroup;
        const materialIndex = primitivesDef[0].material;
        if (materialIndex != null) {
          this._setupPrimitive(mesh, materialIndex);
        }
      } else {
        const group = meshOrGroup;
        for (let i = 0; i < primitivesDef.length; i++) {
          const mesh = group.children[i];
          const materialIndex = primitivesDef[i].material;
          if (materialIndex != null) {
            this._setupPrimitive(mesh, materialIndex);
          }
        }
      }
      return meshOrGroup;
    }
    /**
     * Delete use of `KHR_materials_unlit` from its `materials` if the material is using MToon.
     *
     * Since GLTFLoader have so many hardcoded procedure related to `KHR_materials_unlit`
     * we have to delete the extension before we start to parse the glTF.
     */
    _removeUnlitExtensionIfMToonExists() {
      const parser = this.parser;
      const json = parser.json;
      const materialDefs = json.materials;
      materialDefs?.map((materialDef, iMaterial) => {
        const extension = this._getMToonExtension(iMaterial);
        if (extension && materialDef.extensions?.["KHR_materials_unlit"]) {
          delete materialDef.extensions["KHR_materials_unlit"];
        }
      });
    }
    _getMToonExtension(materialIndex) {
      const parser = this.parser;
      const json = parser.json;
      const materialDef = json.materials?.[materialIndex];
      if (materialDef == null) {
        console.warn(
          `MToonMaterialLoaderPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`
        );
        return void 0;
      }
      const extension = materialDef.extensions?.[_MToonMaterialLoaderPlugin.EXTENSION_NAME];
      if (extension == null) {
        return void 0;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS6.has(specVersion)) {
        console.warn(
          `MToonMaterialLoaderPlugin: Unknown ${_MToonMaterialLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`
        );
        return void 0;
      }
      return extension;
    }
    async _extendMaterialParams(extension, materialParams) {
      delete materialParams.metalness;
      delete materialParams.roughness;
      const assignHelper = new GLTFMToonMaterialParamsAssignHelper(this.parser, materialParams);
      assignHelper.assignPrimitive("transparentWithZWrite", extension.transparentWithZWrite);
      assignHelper.assignColor("shadeColorFactor", extension.shadeColorFactor);
      assignHelper.assignTexture("shadeMultiplyTexture", extension.shadeMultiplyTexture, true);
      assignHelper.assignPrimitive("shadingShiftFactor", extension.shadingShiftFactor);
      assignHelper.assignTexture("shadingShiftTexture", extension.shadingShiftTexture, true);
      assignHelper.assignPrimitive("shadingShiftTextureScale", extension.shadingShiftTexture?.scale);
      assignHelper.assignPrimitive("shadingToonyFactor", extension.shadingToonyFactor);
      assignHelper.assignPrimitive("giEqualizationFactor", extension.giEqualizationFactor);
      assignHelper.assignColor("matcapFactor", extension.matcapFactor);
      assignHelper.assignTexture("matcapTexture", extension.matcapTexture, true);
      assignHelper.assignColor("parametricRimColorFactor", extension.parametricRimColorFactor);
      assignHelper.assignTexture("rimMultiplyTexture", extension.rimMultiplyTexture, true);
      assignHelper.assignPrimitive("rimLightingMixFactor", extension.rimLightingMixFactor);
      assignHelper.assignPrimitive("parametricRimFresnelPowerFactor", extension.parametricRimFresnelPowerFactor);
      assignHelper.assignPrimitive("parametricRimLiftFactor", extension.parametricRimLiftFactor);
      assignHelper.assignPrimitive("outlineWidthMode", extension.outlineWidthMode);
      assignHelper.assignPrimitive("outlineWidthFactor", extension.outlineWidthFactor);
      assignHelper.assignTexture("outlineWidthMultiplyTexture", extension.outlineWidthMultiplyTexture, false);
      assignHelper.assignColor("outlineColorFactor", extension.outlineColorFactor);
      assignHelper.assignPrimitive("outlineLightingMixFactor", extension.outlineLightingMixFactor);
      assignHelper.assignTexture("uvAnimationMaskTexture", extension.uvAnimationMaskTexture, false);
      assignHelper.assignPrimitive("uvAnimationScrollXSpeedFactor", extension.uvAnimationScrollXSpeedFactor);
      assignHelper.assignPrimitive("uvAnimationScrollYSpeedFactor", extension.uvAnimationScrollYSpeedFactor);
      assignHelper.assignPrimitive("uvAnimationRotationSpeedFactor", extension.uvAnimationRotationSpeedFactor);
      assignHelper.assignPrimitive("v0CompatShade", this.v0CompatShade);
      assignHelper.assignPrimitive("debugMode", this.debugMode);
      await assignHelper.pending;
    }
    /**
     * This will do two processes that is required to render MToon properly.
     *
     * - Set render order
     * - Generate outline
     *
     * @param mesh A target GLTF primitive
     * @param materialIndex The material index of the primitive
     */
    _setupPrimitive(mesh, materialIndex) {
      const extension = this._getMToonExtension(materialIndex);
      if (extension) {
        const renderOrder = this._parseRenderOrder(extension);
        mesh.renderOrder = renderOrder + this.renderOrderOffset;
        this._generateOutline(mesh);
        this._addToMaterialSet(mesh);
        return;
      }
    }
    /**
     * Check whether the material should generate outline or not.
     * @param surfaceMaterial The material to check
     * @returns True if the material should generate outline
     */
    _shouldGenerateOutline(surfaceMaterial) {
      return typeof surfaceMaterial.outlineWidthMode === "string" && surfaceMaterial.outlineWidthMode !== "none" && typeof surfaceMaterial.outlineWidthFactor === "number" && surfaceMaterial.outlineWidthFactor > 0;
    }
    /**
     * Generate outline for the given mesh, if it needs.
     *
     * @param mesh The target mesh
     */
    _generateOutline(mesh) {
      const surfaceMaterial = mesh.material;
      if (!(surfaceMaterial instanceof Material)) {
        return;
      }
      if (!this._shouldGenerateOutline(surfaceMaterial)) {
        return;
      }
      mesh.material = [surfaceMaterial];
      const outlineMaterial = surfaceMaterial.clone();
      outlineMaterial.name += " (Outline)";
      outlineMaterial.isOutline = true;
      outlineMaterial.side = BackSide;
      mesh.material.push(outlineMaterial);
      const geometry = mesh.geometry;
      const primitiveVertices = geometry.index ? geometry.index.count : geometry.attributes.position.count / 3;
      geometry.addGroup(0, primitiveVertices, 0);
      geometry.addGroup(0, primitiveVertices, 1);
    }
    _addToMaterialSet(mesh) {
      const materialOrMaterials = mesh.material;
      const materialSet = /* @__PURE__ */ new Set();
      if (Array.isArray(materialOrMaterials)) {
        materialOrMaterials.forEach((material) => materialSet.add(material));
      } else {
        materialSet.add(materialOrMaterials);
      }
      for (const material of materialSet) {
        this._mToonMaterialSet.add(material);
      }
    }
    _parseRenderOrder(extension) {
      const enabledZWrite = extension.transparentWithZWrite;
      return (enabledZWrite ? 0 : 19) + (extension.renderQueueOffsetNumber ?? 0);
    }
  };
  _MToonMaterialLoaderPlugin.EXTENSION_NAME = "VRMC_materials_mtoon";
  var MToonMaterialLoaderPlugin = _MToonMaterialLoaderPlugin;

  // ../assets_src/three-vrm/packages/three-vrm-materials-hdr-emissive-multiplier/src/VRMMaterialsHDREmissiveMultiplierLoaderPlugin.ts
  var _VRMMaterialsHDREmissiveMultiplierLoaderPlugin = class _VRMMaterialsHDREmissiveMultiplierLoaderPlugin {
    get name() {
      return _VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME;
    }
    constructor(parser) {
      this.parser = parser;
    }
    async extendMaterialParams(materialIndex, materialParams) {
      const extension = this._getHDREmissiveMultiplierExtension(materialIndex);
      if (extension == null) {
        return;
      }
      console.warn(
        "VRMMaterialsHDREmissiveMultiplierLoaderPlugin: `VRMC_materials_hdr_emissiveMultiplier` is archived. Use `KHR_materials_emissive_strength` instead."
      );
      const emissiveMultiplier = extension.emissiveMultiplier;
      materialParams.emissiveIntensity = emissiveMultiplier;
    }
    _getHDREmissiveMultiplierExtension(materialIndex) {
      const parser = this.parser;
      const json = parser.json;
      const materialDef = json.materials?.[materialIndex];
      if (materialDef == null) {
        console.warn(
          `VRMMaterialsHDREmissiveMultiplierLoaderPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`
        );
        return void 0;
      }
      const extension = materialDef.extensions?.[_VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME];
      if (extension == null) {
        return void 0;
      }
      return extension;
    }
  };
  _VRMMaterialsHDREmissiveMultiplierLoaderPlugin.EXTENSION_NAME = "VRMC_materials_hdr_emissiveMultiplier";
  var VRMMaterialsHDREmissiveMultiplierLoaderPlugin = _VRMMaterialsHDREmissiveMultiplierLoaderPlugin;

  // ../assets_src/three-vrm/packages/three-vrm-materials-v0compat/src/utils/gammaEOTF.ts
  function gammaEOTF(e) {
    return Math.pow(e, 2.2);
  }

  // ../assets_src/three-vrm/packages/three-vrm-materials-v0compat/src/VRMMaterialsV0CompatPlugin.ts
  var VRMMaterialsV0CompatPlugin = class {
    get name() {
      return "VRMMaterialsV0CompatPlugin";
    }
    constructor(parser) {
      this.parser = parser;
      this._renderQueueMapTransparent = /* @__PURE__ */ new Map();
      this._renderQueueMapTransparentZWrite = /* @__PURE__ */ new Map();
      const json = this.parser.json;
      json.extensionsUsed = json.extensionsUsed ?? [];
      if (json.extensionsUsed.indexOf("KHR_texture_transform") === -1) {
        json.extensionsUsed.push("KHR_texture_transform");
      }
    }
    async beforeRoot() {
      const json = this.parser.json;
      const v0VRMExtension = json.extensions?.["VRM"];
      const v0MaterialProperties = v0VRMExtension?.materialProperties;
      if (!v0MaterialProperties) {
        return;
      }
      this._populateRenderQueueMap(v0MaterialProperties);
      v0MaterialProperties.forEach((materialProperties, materialIndex) => {
        const materialDef = json.materials?.[materialIndex];
        if (materialDef == null) {
          console.warn(
            `VRMMaterialsV0CompatPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`
          );
          return;
        }
        if (materialProperties.shader === "VRM/MToon") {
          const material = this._parseV0MToonProperties(materialProperties, materialDef);
          json.materials[materialIndex] = material;
        } else if (materialProperties.shader?.startsWith("VRM/Unlit")) {
          const material = this._parseV0UnlitProperties(materialProperties, materialDef);
          json.materials[materialIndex] = material;
        } else if (materialProperties.shader === "VRM_USE_GLTFSHADER") {
        } else {
          console.warn(`VRMMaterialsV0CompatPlugin: Unknown shader: ${materialProperties.shader}`);
        }
      });
    }
    _parseV0MToonProperties(materialProperties, schemaMaterial) {
      const isTransparent = materialProperties.keywordMap?.["_ALPHABLEND_ON"] ?? false;
      const enabledZWrite = materialProperties.floatProperties?.["_ZWrite"] === 1;
      const transparentWithZWrite = enabledZWrite && isTransparent;
      const renderQueueOffsetNumber = this._v0ParseRenderQueue(materialProperties);
      const isCutoff = materialProperties.keywordMap?.["_ALPHATEST_ON"] ?? false;
      const alphaMode = isTransparent ? "BLEND" : isCutoff ? "MASK" : "OPAQUE";
      const alphaCutoff = isCutoff ? materialProperties.floatProperties?.["_Cutoff"] ?? 0.5 : void 0;
      const cullMode = materialProperties.floatProperties?.["_CullMode"] ?? 2;
      const doubleSided = cullMode === 0;
      const textureTransformExt = this._portTextureTransform(materialProperties);
      const baseColorFactor = (materialProperties.vectorProperties?.["_Color"] ?? [1, 1, 1, 1]).map(
        (v, i) => i === 3 ? v : gammaEOTF(v)
        // alpha channel is stored in linear
      );
      const baseColorTextureIndex = materialProperties.textureProperties?.["_MainTex"];
      const baseColorTexture = baseColorTextureIndex != null ? {
        index: baseColorTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const normalTextureScale = materialProperties.floatProperties?.["_BumpScale"] ?? 1;
      const normalTextureIndex = materialProperties.textureProperties?.["_BumpMap"];
      const normalTexture = normalTextureIndex != null ? {
        index: normalTextureIndex,
        scale: normalTextureScale,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const emissiveFactor = (materialProperties.vectorProperties?.["_EmissionColor"] ?? [0, 0, 0, 1]).map(
        gammaEOTF
      );
      const emissiveTextureIndex = materialProperties.textureProperties?.["_EmissionMap"];
      const emissiveTexture = emissiveTextureIndex != null ? {
        index: emissiveTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const shadeColorFactor = (materialProperties.vectorProperties?.["_ShadeColor"] ?? [0.97, 0.81, 0.86, 1]).map(
        gammaEOTF
      );
      const shadeMultiplyTextureIndex = materialProperties.textureProperties?.["_ShadeTexture"];
      const shadeMultiplyTexture = shadeMultiplyTextureIndex != null ? {
        index: shadeMultiplyTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      let shadingShiftFactor = materialProperties.floatProperties?.["_ShadeShift"] ?? 0;
      let shadingToonyFactor = materialProperties.floatProperties?.["_ShadeToony"] ?? 0.9;
      shadingToonyFactor = MathUtils.lerp(shadingToonyFactor, 1, 0.5 + 0.5 * shadingShiftFactor);
      shadingShiftFactor = -shadingShiftFactor - (1 - shadingToonyFactor);
      const giIntensityFactor = materialProperties.floatProperties?.["_IndirectLightIntensity"] ?? 0.1;
      const giEqualizationFactor = giIntensityFactor ? 1 - giIntensityFactor : void 0;
      const matcapTextureIndex = materialProperties.textureProperties?.["_SphereAdd"];
      const matcapFactor = matcapTextureIndex != null ? [1, 1, 1] : void 0;
      const matcapTexture = matcapTextureIndex != null ? {
        index: matcapTextureIndex
      } : void 0;
      const rimLightingMixFactor = materialProperties.floatProperties?.["_RimLightingMix"] ?? 0;
      const rimMultiplyTextureIndex = materialProperties.textureProperties?.["_RimTexture"];
      const rimMultiplyTexture = rimMultiplyTextureIndex != null ? {
        index: rimMultiplyTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const parametricRimColorFactor = (materialProperties.vectorProperties?.["_RimColor"] ?? [0, 0, 0, 1]).map(
        gammaEOTF
      );
      const parametricRimFresnelPowerFactor = materialProperties.floatProperties?.["_RimFresnelPower"] ?? 1;
      const parametricRimLiftFactor = materialProperties.floatProperties?.["_RimLift"] ?? 0;
      const outlineWidthMode = ["none", "worldCoordinates", "screenCoordinates"][materialProperties.floatProperties?.["_OutlineWidthMode"] ?? 0];
      let outlineWidthFactor = materialProperties.floatProperties?.["_OutlineWidth"] ?? 0;
      outlineWidthFactor = 0.01 * outlineWidthFactor;
      const outlineWidthMultiplyTextureIndex = materialProperties.textureProperties?.["_OutlineWidthTexture"];
      const outlineWidthMultiplyTexture = outlineWidthMultiplyTextureIndex != null ? {
        index: outlineWidthMultiplyTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const outlineColorFactor = (materialProperties.vectorProperties?.["_OutlineColor"] ?? [0, 0, 0]).map(
        gammaEOTF
      );
      const outlineColorMode = materialProperties.floatProperties?.["_OutlineColorMode"] ?? 0;
      const outlineLightingMixFactor = outlineColorMode === 1 ? materialProperties.floatProperties?.["_OutlineLightingMix"] ?? 1 : 0;
      const uvAnimationMaskTextureIndex = materialProperties.textureProperties?.["_UvAnimMaskTexture"];
      const uvAnimationMaskTexture = uvAnimationMaskTextureIndex != null ? {
        index: uvAnimationMaskTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const uvAnimationScrollXSpeedFactor = materialProperties.floatProperties?.["_UvAnimScrollX"] ?? 0;
      let uvAnimationScrollYSpeedFactor = materialProperties.floatProperties?.["_UvAnimScrollY"] ?? 0;
      if (uvAnimationScrollYSpeedFactor != null) {
        uvAnimationScrollYSpeedFactor = -uvAnimationScrollYSpeedFactor;
      }
      const uvAnimationRotationSpeedFactor = materialProperties.floatProperties?.["_UvAnimRotation"] ?? 0;
      const mtoonExtension = {
        specVersion: "1.0",
        transparentWithZWrite,
        renderQueueOffsetNumber,
        shadeColorFactor,
        shadeMultiplyTexture,
        shadingShiftFactor,
        shadingToonyFactor,
        giEqualizationFactor,
        matcapFactor,
        matcapTexture,
        rimLightingMixFactor,
        rimMultiplyTexture,
        parametricRimColorFactor,
        parametricRimFresnelPowerFactor,
        parametricRimLiftFactor,
        outlineWidthMode,
        outlineWidthFactor,
        outlineWidthMultiplyTexture,
        outlineColorFactor,
        outlineLightingMixFactor,
        uvAnimationMaskTexture,
        uvAnimationScrollXSpeedFactor,
        uvAnimationScrollYSpeedFactor,
        uvAnimationRotationSpeedFactor
      };
      return {
        ...schemaMaterial,
        pbrMetallicRoughness: {
          baseColorFactor,
          baseColorTexture
        },
        normalTexture,
        emissiveTexture,
        emissiveFactor,
        alphaMode,
        alphaCutoff,
        doubleSided,
        extensions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          VRMC_materials_mtoon: mtoonExtension
        }
      };
    }
    _parseV0UnlitProperties(materialProperties, schemaMaterial) {
      const isTransparentZWrite = materialProperties.shader === "VRM/UnlitTransparentZWrite";
      const isTransparent = materialProperties.shader === "VRM/UnlitTransparent" || isTransparentZWrite;
      const renderQueueOffsetNumber = this._v0ParseRenderQueue(materialProperties);
      const isCutoff = materialProperties.shader === "VRM/UnlitCutout";
      const alphaMode = isTransparent ? "BLEND" : isCutoff ? "MASK" : "OPAQUE";
      const alphaCutoff = isCutoff ? materialProperties.floatProperties?.["_Cutoff"] ?? 0.5 : void 0;
      const textureTransformExt = this._portTextureTransform(materialProperties);
      const baseColorFactor = (materialProperties.vectorProperties?.["_Color"] ?? [1, 1, 1, 1]).map(gammaEOTF);
      const baseColorTextureIndex = materialProperties.textureProperties?.["_MainTex"];
      const baseColorTexture = baseColorTextureIndex != null ? {
        index: baseColorTextureIndex,
        extensions: {
          ...textureTransformExt
        }
      } : void 0;
      const mtoonExtension = {
        specVersion: "1.0",
        transparentWithZWrite: isTransparentZWrite,
        renderQueueOffsetNumber,
        shadeColorFactor: baseColorFactor,
        shadeMultiplyTexture: baseColorTexture
      };
      return {
        ...schemaMaterial,
        pbrMetallicRoughness: {
          baseColorFactor,
          baseColorTexture
        },
        alphaMode,
        alphaCutoff,
        extensions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          VRMC_materials_mtoon: mtoonExtension
        }
      };
    }
    /**
     * Create a glTF `KHR_texture_transform` extension from v0 texture transform info.
     */
    _portTextureTransform(materialProperties) {
      const textureTransform = materialProperties.vectorProperties?.["_MainTex"];
      if (textureTransform == null) {
        return {};
      }
      const offset = [textureTransform?.[0] ?? 0, textureTransform?.[1] ?? 0];
      const scale = [textureTransform?.[2] ?? 1, textureTransform?.[3] ?? 1];
      offset[1] = 1 - scale[1] - offset[1];
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        KHR_texture_transform: { offset, scale }
      };
    }
    /**
     * Convert v0 render order into v1 render order.
     * This uses a map from v0 render queue to v1 compliant render queue offset which is generated in {@link _populateRenderQueueMap}.
     */
    _v0ParseRenderQueue(materialProperties) {
      const isTransparentZWrite = materialProperties.shader === "VRM/UnlitTransparentZWrite";
      const isTransparent = materialProperties.keywordMap?.["_ALPHABLEND_ON"] != void 0 || materialProperties.shader === "VRM/UnlitTransparent" || isTransparentZWrite;
      const enabledZWrite = materialProperties.floatProperties?.["_ZWrite"] === 1 || isTransparentZWrite;
      let offset = 0;
      if (isTransparent) {
        const v0Queue = materialProperties.renderQueue;
        if (v0Queue != null) {
          if (enabledZWrite) {
            offset = this._renderQueueMapTransparentZWrite.get(v0Queue);
          } else {
            offset = this._renderQueueMapTransparent.get(v0Queue);
          }
        }
      }
      return offset;
    }
    /**
     * Create a map which maps v0 render queue to v1 compliant render queue offset.
     * This lists up all render queues the model use and creates a map to new render queue offsets in the same order.
     */
    _populateRenderQueueMap(materialPropertiesList) {
      const renderQueuesTransparent = /* @__PURE__ */ new Set();
      const renderQueuesTransparentZWrite = /* @__PURE__ */ new Set();
      materialPropertiesList.forEach((materialProperties) => {
        const isTransparentZWrite = materialProperties.shader === "VRM/UnlitTransparentZWrite";
        const isTransparent = materialProperties.keywordMap?.["_ALPHABLEND_ON"] != void 0 || materialProperties.shader === "VRM/UnlitTransparent" || isTransparentZWrite;
        const enabledZWrite = materialProperties.floatProperties?.["_ZWrite"] === 1 || isTransparentZWrite;
        if (isTransparent) {
          const v0Queue = materialProperties.renderQueue;
          if (v0Queue != null) {
            if (enabledZWrite) {
              renderQueuesTransparentZWrite.add(v0Queue);
            } else {
              renderQueuesTransparent.add(v0Queue);
            }
          }
        }
      });
      if (renderQueuesTransparent.size > 10) {
        console.warn(
          `VRMMaterialsV0CompatPlugin: This VRM uses ${renderQueuesTransparent.size} render queues for Transparent materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`
        );
      }
      if (renderQueuesTransparentZWrite.size > 10) {
        console.warn(
          `VRMMaterialsV0CompatPlugin: This VRM uses ${renderQueuesTransparentZWrite.size} render queues for TransparentZWrite materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`
        );
      }
      Array.from(renderQueuesTransparent).sort().forEach((queue, i) => {
        const newQueueOffset = Math.min(Math.max(i - renderQueuesTransparent.size + 1, -9), 0);
        this._renderQueueMapTransparent.set(queue, newQueueOffset);
      });
      Array.from(renderQueuesTransparentZWrite).sort().forEach((queue, i) => {
        const newQueueOffset = Math.min(Math.max(i, 0), 9);
        this._renderQueueMapTransparentZWrite.set(queue, newQueueOffset);
      });
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/helpers/VRMNodeConstraintHelper.ts
  var _v3A6 = new Vector3();
  var VRMNodeConstraintHelper = class extends Group {
    constructor(constraint) {
      super();
      this._attrPosition = new BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 0]), 3);
      this._attrPosition.setUsage(DynamicDrawUsage);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", this._attrPosition);
      const material = new LineBasicMaterial({
        color: 16711935,
        depthTest: false,
        depthWrite: false
      });
      this._line = new Line(geometry, material);
      this.add(this._line);
      this.constraint = constraint;
    }
    updateMatrixWorld(force) {
      _v3A6.setFromMatrixPosition(this.constraint.destination.matrixWorld);
      this._attrPosition.setXYZ(0, _v3A6.x, _v3A6.y, _v3A6.z);
      if (this.constraint.source) {
        _v3A6.setFromMatrixPosition(this.constraint.source.matrixWorld);
      }
      this._attrPosition.setXYZ(1, _v3A6.x, _v3A6.y, _v3A6.z);
      this._attrPosition.needsUpdate = true;
      super.updateMatrixWorld(force);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/utils/decomposePosition.ts
  function decomposePosition(matrix, target) {
    return target.set(matrix.elements[12], matrix.elements[13], matrix.elements[14]);
  }

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/utils/decomposeRotation.ts
  var _v3A7 = new Vector3();
  var _v3B4 = new Vector3();
  function decomposeRotation(matrix, target) {
    matrix.decompose(_v3A7, target, _v3B4);
    return target;
  }

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/utils/quatInvertCompat.ts
  function quatInvertCompat2(target) {
    if (target.invert) {
      target.invert();
    } else {
      target.inverse();
    }
    return target;
  }

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMNodeConstraint.ts
  var VRMNodeConstraint = class {
    /**
     * @param destination The destination object
     * @param source The source object
     */
    constructor(destination, source) {
      this.destination = destination;
      this.source = source;
      this.weight = 1;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMAimConstraint.ts
  var _v3A8 = new Vector3();
  var _v3B5 = new Vector3();
  var _v3C2 = new Vector3();
  var _quatA7 = new Quaternion();
  var _quatB4 = new Quaternion();
  var _quatC2 = new Quaternion();
  var VRMAimConstraint = class extends VRMNodeConstraint {
    /**
     * The aim axis of the constraint.
     */
    get aimAxis() {
      return this._aimAxis;
    }
    /**
     * The aim axis of the constraint.
     */
    set aimAxis(aimAxis) {
      this._aimAxis = aimAxis;
      this._v3AimAxis.set(
        aimAxis === "PositiveX" ? 1 : aimAxis === "NegativeX" ? -1 : 0,
        aimAxis === "PositiveY" ? 1 : aimAxis === "NegativeY" ? -1 : 0,
        aimAxis === "PositiveZ" ? 1 : aimAxis === "NegativeZ" ? -1 : 0
      );
    }
    get dependencies() {
      const set = /* @__PURE__ */ new Set([this.source]);
      if (this.destination.parent) {
        set.add(this.destination.parent);
      }
      return set;
    }
    constructor(destination, source) {
      super(destination, source);
      this._aimAxis = "PositiveX";
      this._v3AimAxis = new Vector3(1, 0, 0);
      this._dstRestQuat = new Quaternion();
    }
    setInitState() {
      this._dstRestQuat.copy(this.destination.quaternion);
    }
    update() {
      this.destination.updateWorldMatrix(true, false);
      this.source.updateWorldMatrix(true, false);
      const dstParentWorldQuat = _quatA7.identity();
      const invDstParentWorldQuat = _quatB4.identity();
      if (this.destination.parent) {
        decomposeRotation(this.destination.parent.matrixWorld, dstParentWorldQuat);
        quatInvertCompat2(invDstParentWorldQuat.copy(dstParentWorldQuat));
      }
      const a0 = _v3A8.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(dstParentWorldQuat);
      const a1 = decomposePosition(this.source.matrixWorld, _v3B5).sub(decomposePosition(this.destination.matrixWorld, _v3C2)).normalize();
      const targetQuat = _quatC2.setFromUnitVectors(a0, a1).premultiply(invDstParentWorldQuat).multiply(dstParentWorldQuat).multiply(this._dstRestQuat);
      this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/utils/traverseAncestorsFromRoot.ts
  function traverseAncestorsFromRoot(object, callback) {
    const ancestors = [object];
    let head = object.parent;
    while (head !== null) {
      ancestors.unshift(head);
      head = head.parent;
    }
    ancestors.forEach((ancestor) => {
      callback(ancestor);
    });
  }

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMNodeConstraintManager.ts
  var VRMNodeConstraintManager = class {
    constructor() {
      this._constraints = /* @__PURE__ */ new Set();
      this._objectConstraintsMap = /* @__PURE__ */ new Map();
    }
    get constraints() {
      return this._constraints;
    }
    addConstraint(constraint) {
      this._constraints.add(constraint);
      let objectSet = this._objectConstraintsMap.get(constraint.destination);
      if (objectSet == null) {
        objectSet = /* @__PURE__ */ new Set();
        this._objectConstraintsMap.set(constraint.destination, objectSet);
      }
      objectSet.add(constraint);
    }
    deleteConstraint(constraint) {
      this._constraints.delete(constraint);
      const objectSet = this._objectConstraintsMap.get(constraint.destination);
      objectSet.delete(constraint);
    }
    setInitState() {
      const constraintsTried = /* @__PURE__ */ new Set();
      const constraintsDone = /* @__PURE__ */ new Set();
      for (const constraint of this._constraints) {
        this._processConstraint(constraint, constraintsTried, constraintsDone, (constraint2) => constraint2.setInitState());
      }
    }
    update() {
      const constraintsTried = /* @__PURE__ */ new Set();
      const constraintsDone = /* @__PURE__ */ new Set();
      for (const constraint of this._constraints) {
        this._processConstraint(constraint, constraintsTried, constraintsDone, (constraint2) => constraint2.update());
      }
    }
    /**
     * Update a constraint.
     * If there are other constraints that are dependant, it will try to update them recursively.
     * It might throw an error if there are circular dependencies.
     *
     * Intended to be used in {@link update} and {@link _processConstraint} itself recursively.
     *
     * @param constraint A constraint you want to update
     * @param constraintsTried Set of constraints that are already tried to be updated
     * @param constraintsDone Set of constraints that are already up to date
     */
    _processConstraint(constraint, constraintsTried, constraintsDone, callback) {
      if (constraintsDone.has(constraint)) {
        return;
      }
      if (constraintsTried.has(constraint)) {
        throw new Error("VRMNodeConstraintManager: Circular dependency detected while updating constraints");
      }
      constraintsTried.add(constraint);
      const depObjects = constraint.dependencies;
      for (const depObject of depObjects) {
        traverseAncestorsFromRoot(depObject, (depObjectAncestor) => {
          const objectSet = this._objectConstraintsMap.get(depObjectAncestor);
          if (objectSet) {
            for (const depConstraint of objectSet) {
              this._processConstraint(depConstraint, constraintsTried, constraintsDone, callback);
            }
          }
        });
      }
      callback(constraint);
      constraintsDone.add(constraint);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMRotationConstraint.ts
  var _quatA8 = new Quaternion();
  var _quatB5 = new Quaternion();
  var VRMRotationConstraint = class extends VRMNodeConstraint {
    get dependencies() {
      return /* @__PURE__ */ new Set([this.source]);
    }
    constructor(destination, source) {
      super(destination, source);
      this._dstRestQuat = new Quaternion();
      this._invSrcRestQuat = new Quaternion();
    }
    setInitState() {
      this._dstRestQuat.copy(this.destination.quaternion);
      quatInvertCompat2(this._invSrcRestQuat.copy(this.source.quaternion));
    }
    update() {
      const srcDeltaQuat = _quatA8.copy(this._invSrcRestQuat).multiply(this.source.quaternion);
      const targetQuat = _quatB5.copy(this._dstRestQuat).multiply(srcDeltaQuat);
      this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMRollConstraint.ts
  var _v3A9 = new Vector3();
  var _quatA9 = new Quaternion();
  var _quatB6 = new Quaternion();
  var VRMRollConstraint = class extends VRMNodeConstraint {
    /**
     * The roll axis of the constraint.
     */
    get rollAxis() {
      return this._rollAxis;
    }
    /**
     * The roll axis of the constraint.
     */
    set rollAxis(rollAxis) {
      this._rollAxis = rollAxis;
      this._v3RollAxis.set(rollAxis === "X" ? 1 : 0, rollAxis === "Y" ? 1 : 0, rollAxis === "Z" ? 1 : 0);
    }
    get dependencies() {
      return /* @__PURE__ */ new Set([this.source]);
    }
    constructor(destination, source) {
      super(destination, source);
      this._rollAxis = "X";
      this._v3RollAxis = new Vector3(1, 0, 0);
      this._dstRestQuat = new Quaternion();
      this._invDstRestQuat = new Quaternion();
      this._invSrcRestQuatMulDstRestQuat = new Quaternion();
    }
    setInitState() {
      this._dstRestQuat.copy(this.destination.quaternion);
      quatInvertCompat2(this._invDstRestQuat.copy(this._dstRestQuat));
      quatInvertCompat2(this._invSrcRestQuatMulDstRestQuat.copy(this.source.quaternion)).multiply(this._dstRestQuat);
    }
    update() {
      const quatDelta = _quatA9.copy(this._invDstRestQuat).multiply(this.source.quaternion).multiply(this._invSrcRestQuatMulDstRestQuat);
      const n1 = _v3A9.copy(this._v3RollAxis).applyQuaternion(quatDelta);
      const quatFromTo = _quatB6.setFromUnitVectors(n1, this._v3RollAxis);
      const targetQuat = quatFromTo.premultiply(this._dstRestQuat).multiply(quatDelta);
      this.destination.quaternion.copy(this._dstRestQuat).slerp(targetQuat, this.weight);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-node-constraint/src/VRMNodeConstraintLoaderPlugin.ts
  var POSSIBLE_SPEC_VERSIONS7 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var _VRMNodeConstraintLoaderPlugin = class _VRMNodeConstraintLoaderPlugin {
    get name() {
      return _VRMNodeConstraintLoaderPlugin.EXTENSION_NAME;
    }
    constructor(parser, options) {
      this.parser = parser;
      this.helperRoot = options?.helperRoot;
    }
    async afterRoot(gltf) {
      gltf.userData.vrmNodeConstraintManager = await this._import(gltf);
    }
    /**
     * Import constraints from a GLTF and returns a {@link VRMNodeConstraintManager}.
     * It might return `null` instead when it does not need to be created or something go wrong.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     */
    async _import(gltf) {
      const json = this.parser.json;
      const isConstraintsUsed = json.extensionsUsed?.indexOf(_VRMNodeConstraintLoaderPlugin.EXTENSION_NAME) !== -1;
      if (!isConstraintsUsed) {
        return null;
      }
      const manager = new VRMNodeConstraintManager();
      const threeNodes = await this.parser.getDependencies("node");
      threeNodes.forEach((node, nodeIndex) => {
        const schemaNode = json.nodes[nodeIndex];
        const extension = schemaNode?.extensions?.[_VRMNodeConstraintLoaderPlugin.EXTENSION_NAME];
        if (extension == null) {
          return;
        }
        const specVersion = extension.specVersion;
        if (!POSSIBLE_SPEC_VERSIONS7.has(specVersion)) {
          console.warn(
            `VRMNodeConstraintLoaderPlugin: Unknown ${_VRMNodeConstraintLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`
          );
          return;
        }
        const constraintDef = extension.constraint;
        if (constraintDef.roll != null) {
          const constraint = this._importRollConstraint(node, threeNodes, constraintDef.roll);
          manager.addConstraint(constraint);
        } else if (constraintDef.aim != null) {
          const constraint = this._importAimConstraint(node, threeNodes, constraintDef.aim);
          manager.addConstraint(constraint);
        } else if (constraintDef.rotation != null) {
          const constraint = this._importRotationConstraint(node, threeNodes, constraintDef.rotation);
          manager.addConstraint(constraint);
        }
      });
      gltf.scene.updateMatrixWorld();
      manager.setInitState();
      return manager;
    }
    _importRollConstraint(destination, nodes, rollConstraintDef) {
      const { source: sourceIndex, rollAxis, weight } = rollConstraintDef;
      const source = nodes[sourceIndex];
      const constraint = new VRMRollConstraint(destination, source);
      if (rollAxis != null) {
        constraint.rollAxis = rollAxis;
      }
      if (weight != null) {
        constraint.weight = weight;
      }
      if (this.helperRoot) {
        const helper = new VRMNodeConstraintHelper(constraint);
        this.helperRoot.add(helper);
      }
      return constraint;
    }
    _importAimConstraint(destination, nodes, aimConstraintDef) {
      const { source: sourceIndex, aimAxis, weight } = aimConstraintDef;
      const source = nodes[sourceIndex];
      const constraint = new VRMAimConstraint(destination, source);
      if (aimAxis != null) {
        constraint.aimAxis = aimAxis;
      }
      if (weight != null) {
        constraint.weight = weight;
      }
      if (this.helperRoot) {
        const helper = new VRMNodeConstraintHelper(constraint);
        this.helperRoot.add(helper);
      }
      return constraint;
    }
    _importRotationConstraint(destination, nodes, rotationConstraintDef) {
      const { source: sourceIndex, weight } = rotationConstraintDef;
      const source = nodes[sourceIndex];
      const constraint = new VRMRotationConstraint(destination, source);
      if (weight != null) {
        constraint.weight = weight;
      }
      if (this.helperRoot) {
        const helper = new VRMNodeConstraintHelper(constraint);
        this.helperRoot.add(helper);
      }
      return constraint;
    }
  };
  _VRMNodeConstraintLoaderPlugin.EXTENSION_NAME = "VRMC_node_constraint";
  var VRMNodeConstraintLoaderPlugin = _VRMNodeConstraintLoaderPlugin;

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneColliderShape.ts
  var VRMSpringBoneColliderShape = class {
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneColliderShapeCapsule.ts
  var _v3A10 = new Vector3();
  var _v3B6 = new Vector3();
  var VRMSpringBoneColliderShapeCapsule = class extends VRMSpringBoneColliderShape {
    get type() {
      return "capsule";
    }
    constructor(params) {
      super();
      this.offset = params?.offset ?? new Vector3(0, 0, 0);
      this.tail = params?.tail ?? new Vector3(0, 0, 0);
      this.radius = params?.radius ?? 0;
      this.inside = params?.inside ?? false;
    }
    calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
      _v3A10.setFromMatrixPosition(colliderMatrix);
      _v3B6.subVectors(this.tail, this.offset).applyMatrix4(colliderMatrix);
      _v3B6.sub(_v3A10);
      const lengthSqCapsule = _v3B6.lengthSq();
      target.copy(objectPosition).sub(_v3A10);
      const dot = _v3B6.dot(target);
      if (dot <= 0) {
      } else if (lengthSqCapsule <= dot) {
        target.sub(_v3B6);
      } else {
        _v3B6.multiplyScalar(dot / lengthSqCapsule);
        target.sub(_v3B6);
      }
      const length = target.length();
      const distance = this.inside ? this.radius - objectRadius - length : length - objectRadius - this.radius;
      if (distance < 0) {
        target.multiplyScalar(1 / length);
        if (this.inside) {
          target.negate();
        }
      }
      return distance;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneColliderShapePlane.ts
  var _v3A11 = new Vector3();
  var _mat3A = new Matrix3();
  var VRMSpringBoneColliderShapePlane = class extends VRMSpringBoneColliderShape {
    get type() {
      return "plane";
    }
    constructor(params) {
      super();
      this.offset = params?.offset ?? new Vector3(0, 0, 0);
      this.normal = params?.normal ?? new Vector3(0, 0, 1);
    }
    calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
      target.setFromMatrixPosition(colliderMatrix);
      target.negate().add(objectPosition);
      _mat3A.getNormalMatrix(colliderMatrix);
      _v3A11.copy(this.normal).applyNormalMatrix(_mat3A).normalize();
      const distance = target.dot(_v3A11) - objectRadius;
      target.copy(_v3A11);
      return distance;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneColliderShapeSphere.ts
  var _v3A12 = new Vector3();
  var VRMSpringBoneColliderShapeSphere = class extends VRMSpringBoneColliderShape {
    get type() {
      return "sphere";
    }
    constructor(params) {
      super();
      this.offset = params?.offset ?? new Vector3(0, 0, 0);
      this.radius = params?.radius ?? 0;
      this.inside = params?.inside ?? false;
    }
    calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
      target.subVectors(objectPosition, _v3A12.setFromMatrixPosition(colliderMatrix));
      const length = target.length();
      const distance = this.inside ? this.radius - objectRadius - length : length - objectRadius - this.radius;
      if (distance < 0) {
        target.multiplyScalar(1 / length);
        if (this.inside) {
          target.negate();
        }
      }
      return distance;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/utils/ColliderShapeCapsuleBufferGeometry.ts
  var _v3A13 = new Vector3();
  var ColliderShapeCapsuleBufferGeometry = class extends BufferGeometry {
    constructor(shape) {
      super();
      this.worldScale = 1;
      this._currentRadius = 0;
      this._currentOffset = new Vector3();
      this._currentTail = new Vector3();
      this._shape = shape;
      this._attrPos = new BufferAttribute(new Float32Array(396), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(264), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      const radius = this._shape.radius / this.worldScale;
      if (this._currentRadius !== radius) {
        this._currentRadius = radius;
        shouldUpdateGeometry = true;
      }
      if (!this._currentOffset.equals(this._shape.offset)) {
        this._currentOffset.copy(this._shape.offset);
        shouldUpdateGeometry = true;
      }
      const tail = _v3A13.copy(this._shape.tail).divideScalar(this.worldScale);
      if (this._currentTail.distanceToSquared(tail) > 1e-10) {
        this._currentTail.copy(tail);
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      _v3A13.copy(this._currentTail).sub(this._currentOffset);
      const l = _v3A13.length() / this._currentRadius;
      for (let i = 0; i <= 16; i++) {
        const t = i / 16 * Math.PI;
        this._attrPos.setXYZ(i, -Math.sin(t), -Math.cos(t), 0);
        this._attrPos.setXYZ(17 + i, l + Math.sin(t), Math.cos(t), 0);
        this._attrPos.setXYZ(34 + i, -Math.sin(t), 0, -Math.cos(t));
        this._attrPos.setXYZ(51 + i, l + Math.sin(t), 0, Math.cos(t));
      }
      for (let i = 0; i < 32; i++) {
        const t = i / 16 * Math.PI;
        this._attrPos.setXYZ(68 + i, 0, Math.sin(t), Math.cos(t));
        this._attrPos.setXYZ(100 + i, l, Math.sin(t), Math.cos(t));
      }
      const theta = Math.atan2(_v3A13.y, Math.sqrt(_v3A13.x * _v3A13.x + _v3A13.z * _v3A13.z));
      const phi = -Math.atan2(_v3A13.z, _v3A13.x);
      this.rotateZ(theta);
      this.rotateY(phi);
      this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
      this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      for (let i = 0; i < 34; i++) {
        const i1 = (i + 1) % 34;
        this._attrIndex.setXY(i * 2, i, i1);
        this._attrIndex.setXY(68 + i * 2, 34 + i, 34 + i1);
      }
      for (let i = 0; i < 32; i++) {
        const i1 = (i + 1) % 32;
        this._attrIndex.setXY(136 + i * 2, 68 + i, 68 + i1);
        this._attrIndex.setXY(200 + i * 2, 100 + i, 100 + i1);
      }
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/utils/ColliderShapePlaneBufferGeometry.ts
  var ColliderShapePlaneBufferGeometry = class extends BufferGeometry {
    constructor(shape) {
      super();
      this.worldScale = 1;
      this._currentOffset = new Vector3();
      this._currentNormal = new Vector3();
      this._shape = shape;
      this._attrPos = new BufferAttribute(new Float32Array(6 * 3), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(10), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      if (!this._currentOffset.equals(this._shape.offset)) {
        this._currentOffset.copy(this._shape.offset);
        shouldUpdateGeometry = true;
      }
      if (!this._currentNormal.equals(this._shape.normal)) {
        this._currentNormal.copy(this._shape.normal);
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      this._attrPos.setXYZ(0, -0.5, -0.5, 0);
      this._attrPos.setXYZ(1, 0.5, -0.5, 0);
      this._attrPos.setXYZ(2, 0.5, 0.5, 0);
      this._attrPos.setXYZ(3, -0.5, 0.5, 0);
      this._attrPos.setXYZ(4, 0, 0, 0);
      this._attrPos.setXYZ(5, 0, 0, 0.25);
      this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
      this.lookAt(this._currentNormal);
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      this._attrIndex.setXY(0, 0, 1);
      this._attrIndex.setXY(2, 1, 2);
      this._attrIndex.setXY(4, 2, 3);
      this._attrIndex.setXY(6, 3, 0);
      this._attrIndex.setXY(8, 4, 5);
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/utils/ColliderShapeSphereBufferGeometry.ts
  var ColliderShapeSphereBufferGeometry = class extends BufferGeometry {
    constructor(shape) {
      super();
      this.worldScale = 1;
      this._currentRadius = 0;
      this._currentOffset = new Vector3();
      this._shape = shape;
      this._attrPos = new BufferAttribute(new Float32Array(32 * 3 * 3), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(64 * 3), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      const radius = this._shape.radius / this.worldScale;
      if (this._currentRadius !== radius) {
        this._currentRadius = radius;
        shouldUpdateGeometry = true;
      }
      if (!this._currentOffset.equals(this._shape.offset)) {
        this._currentOffset.copy(this._shape.offset);
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      for (let i = 0; i < 32; i++) {
        const t = i / 16 * Math.PI;
        this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
        this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
        this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
      }
      this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
      this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      for (let i = 0; i < 32; i++) {
        const i1 = (i + 1) % 32;
        this._attrIndex.setXY(i * 2, i, i1);
        this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
        this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
      }
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/VRMSpringBoneColliderHelper.ts
  var _v3A14 = new Vector3();
  var VRMSpringBoneColliderHelper = class extends Group {
    constructor(collider) {
      super();
      this.matrixAutoUpdate = false;
      this.collider = collider;
      if (this.collider.shape instanceof VRMSpringBoneColliderShapeSphere) {
        this._geometry = new ColliderShapeSphereBufferGeometry(this.collider.shape);
      } else if (this.collider.shape instanceof VRMSpringBoneColliderShapeCapsule) {
        this._geometry = new ColliderShapeCapsuleBufferGeometry(this.collider.shape);
      } else if (this.collider.shape instanceof VRMSpringBoneColliderShapePlane) {
        this._geometry = new ColliderShapePlaneBufferGeometry(this.collider.shape);
      } else {
        throw new Error("VRMSpringBoneColliderHelper: Unknown collider shape type detected");
      }
      const material = new LineBasicMaterial({
        color: 16711935,
        depthTest: false,
        depthWrite: false
      });
      this._line = new LineSegments(this._geometry, material);
      this.add(this._line);
    }
    dispose() {
      this._geometry.dispose();
    }
    updateMatrixWorld(force) {
      this.collider.updateWorldMatrix(true, false);
      this.matrix.copy(this.collider.matrixWorld);
      const matrixWorldElements = this.matrix.elements;
      this._geometry.worldScale = _v3A14.set(matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2]).length();
      this._geometry.update();
      super.updateMatrixWorld(force);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/utils/SpringBoneBufferGeometry.ts
  var SpringBoneBufferGeometry = class extends BufferGeometry {
    constructor(springBone) {
      super();
      this.worldScale = 1;
      this._currentRadius = 0;
      this._currentTail = new Vector3();
      this._springBone = springBone;
      this._attrPos = new BufferAttribute(new Float32Array(294), 3);
      this.setAttribute("position", this._attrPos);
      this._attrIndex = new BufferAttribute(new Uint16Array(194), 1);
      this.setIndex(this._attrIndex);
      this._buildIndex();
      this.update();
    }
    update() {
      let shouldUpdateGeometry = false;
      const radius = this._springBone.settings.hitRadius / this.worldScale;
      if (this._currentRadius !== radius) {
        this._currentRadius = radius;
        shouldUpdateGeometry = true;
      }
      if (!this._currentTail.equals(this._springBone.initialLocalChildPosition)) {
        this._currentTail.copy(this._springBone.initialLocalChildPosition);
        shouldUpdateGeometry = true;
      }
      if (shouldUpdateGeometry) {
        this._buildPosition();
      }
    }
    _buildPosition() {
      for (let i = 0; i < 32; i++) {
        const t = i / 16 * Math.PI;
        this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0);
        this._attrPos.setXYZ(32 + i, 0, Math.cos(t), Math.sin(t));
        this._attrPos.setXYZ(64 + i, Math.sin(t), 0, Math.cos(t));
      }
      this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
      this.translate(this._currentTail.x, this._currentTail.y, this._currentTail.z);
      this._attrPos.setXYZ(96, 0, 0, 0);
      this._attrPos.setXYZ(97, this._currentTail.x, this._currentTail.y, this._currentTail.z);
      this._attrPos.needsUpdate = true;
    }
    _buildIndex() {
      for (let i = 0; i < 32; i++) {
        const i1 = (i + 1) % 32;
        this._attrIndex.setXY(i * 2, i, i1);
        this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
        this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
      }
      this._attrIndex.setXY(192, 96, 97);
      this._attrIndex.needsUpdate = true;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/helpers/VRMSpringBoneJointHelper.ts
  var _v3A15 = new Vector3();
  var VRMSpringBoneJointHelper = class extends Group {
    constructor(springBone) {
      super();
      this.matrixAutoUpdate = false;
      this.springBone = springBone;
      this._geometry = new SpringBoneBufferGeometry(this.springBone);
      const material = new LineBasicMaterial({
        color: 16776960,
        depthTest: false,
        depthWrite: false
      });
      this._line = new LineSegments(this._geometry, material);
      this.add(this._line);
    }
    dispose() {
      this._geometry.dispose();
    }
    updateMatrixWorld(force) {
      this.springBone.bone.updateWorldMatrix(true, false);
      this.matrix.copy(this.springBone.bone.matrixWorld);
      const matrixWorldElements = this.matrix.elements;
      this._geometry.worldScale = _v3A15.set(matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2]).length();
      this._geometry.update();
      super.updateMatrixWorld(force);
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneCollider.ts
  var VRMSpringBoneCollider = class extends Object3D {
    constructor(shape) {
      super();
      /**
       * World space matrix for the collider shape used in collision calculations.
       */
      this.colliderMatrix = new Matrix4();
      this.shape = shape;
    }
    updateWorldMatrix(updateParents, updateChildren) {
      super.updateWorldMatrix(updateParents, updateChildren);
      updateColliderMatrix(this.colliderMatrix, this.matrixWorld, this.shape.offset);
    }
  };
  function updateColliderMatrix(colliderMatrix, matrixWorld, offset) {
    const me = matrixWorld.elements;
    colliderMatrix.copy(matrixWorld);
    if (offset) {
      colliderMatrix.elements[12] = me[0] * offset.x + me[4] * offset.y + me[8] * offset.z + me[12];
      colliderMatrix.elements[13] = me[1] * offset.x + me[5] * offset.y + me[9] * offset.z + me[13];
      colliderMatrix.elements[14] = me[2] * offset.x + me[6] * offset.y + me[10] * offset.z + me[14];
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/utils/mat4InvertCompat.ts
  var _matA = new Matrix4();
  function mat4InvertCompat(target) {
    if (target.invert) {
      target.invert();
    } else {
      target.getInverse(_matA.copy(target));
    }
    return target;
  }

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/utils/Matrix4InverseCache.ts
  var Matrix4InverseCache = class {
    constructor(matrix) {
      /**
       * A cache of inverse of current matrix.
       */
      this._inverseCache = new Matrix4();
      /**
       * A flag that makes it want to recalculate its {@link _inverseCache}.
       * Will be set `true` when `elements` are mutated and be used in `getInverse`.
       */
      this._shouldUpdateInverse = true;
      this.matrix = matrix;
      const handler = {
        set: (obj, prop, newVal) => {
          this._shouldUpdateInverse = true;
          obj[prop] = newVal;
          return true;
        }
      };
      this._originalElements = matrix.elements;
      matrix.elements = new Proxy(matrix.elements, handler);
    }
    /**
     * Inverse of given matrix.
     * Note that it will return its internal private instance.
     * Make sure copying this before mutate this.
     */
    get inverse() {
      if (this._shouldUpdateInverse) {
        mat4InvertCompat(this._inverseCache.copy(this.matrix));
        this._shouldUpdateInverse = false;
      }
      return this._inverseCache;
    }
    revert() {
      this.matrix.elements = this._originalElements;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneJoint.ts
  var IDENTITY_MATRIX4 = new Matrix4();
  var _v3A16 = new Vector3();
  var _v3B7 = new Vector3();
  var _worldSpacePosition = new Vector3();
  var _nextTail = new Vector3();
  var _matA2 = new Matrix4();
  var VRMSpringBoneJoint = class {
    /**
     * Create a new VRMSpringBone.
     *
     * @param bone An Object3D that will be attached to this bone
     * @param child An Object3D that will be used as a tail of this spring bone. It can be null when the spring bone is imported from VRM 0.0
     * @param settings Several parameters related to behavior of the spring bone
     * @param colliderGroups Collider groups that will be collided with this spring bone
     */
    constructor(bone, child, settings = {}, colliderGroups = []) {
      /**
       * Current position of child tail, in center unit. Will be used for verlet integration.
       */
      this._currentTail = new Vector3();
      /**
       * Previous position of child tail, in center unit. Will be used for verlet integration.
       */
      this._prevTail = new Vector3();
      /**
       * Initial axis of the bone, in local unit.
       */
      this._boneAxis = new Vector3();
      /**
       * Length of the bone in world unit.
       * Will be used for normalization in update loop, will be updated by {@link _calcWorldSpaceBoneLength}.
       *
       * It's same as local unit length unless there are scale transformations in the world space.
       */
      this._worldSpaceBoneLength = 0;
      /**
       * This springbone will be calculated based on the space relative from this object.
       * If this is `null`, springbone will be calculated in world space.
       */
      this._center = null;
      /**
       * Initial state of the local matrix of the bone.
       */
      this._initialLocalMatrix = new Matrix4();
      /**
       * Initial state of the rotation of the bone.
       */
      this._initialLocalRotation = new Quaternion();
      /**
       * Initial state of the position of its child.
       */
      this._initialLocalChildPosition = new Vector3();
      this.bone = bone;
      this.bone.matrixAutoUpdate = false;
      this.child = child;
      this.settings = {
        hitRadius: settings.hitRadius ?? 0,
        stiffness: settings.stiffness ?? 1,
        gravityPower: settings.gravityPower ?? 0,
        gravityDir: settings.gravityDir?.clone() ?? new Vector3(0, -1, 0),
        dragForce: settings.dragForce ?? 0.4
      };
      this.colliderGroups = colliderGroups;
    }
    /**
     * Set of dependencies that need to be updated before this joint.
     */
    get dependencies() {
      const set = /* @__PURE__ */ new Set();
      const parent = this.bone.parent;
      if (parent) {
        set.add(parent);
      }
      for (let cg = 0; cg < this.colliderGroups.length; cg++) {
        for (let c = 0; c < this.colliderGroups[cg].colliders.length; c++) {
          set.add(this.colliderGroups[cg].colliders[c]);
        }
      }
      return set;
    }
    get center() {
      return this._center;
    }
    set center(center) {
      if (this._center?.userData.inverseCacheProxy) {
        this._center.userData.inverseCacheProxy.revert();
        delete this._center.userData.inverseCacheProxy;
      }
      this._center = center;
      if (this._center) {
        if (!this._center.userData.inverseCacheProxy) {
          this._center.userData.inverseCacheProxy = new Matrix4InverseCache(this._center.matrixWorld);
        }
      }
    }
    get initialLocalChildPosition() {
      return this._initialLocalChildPosition;
    }
    /**
     * Returns the world matrix of its parent object.
     * Note that it returns a reference to the matrix. Don't mutate this directly!
     */
    get _parentMatrixWorld() {
      return this.bone.parent ? this.bone.parent.matrixWorld : IDENTITY_MATRIX4;
    }
    /**
     * Set the initial state of this spring bone.
     * You might want to call {@link VRMSpringBoneManager.setInitState} instead.
     */
    setInitState() {
      this._initialLocalMatrix.copy(this.bone.matrix);
      this._initialLocalRotation.copy(this.bone.quaternion);
      if (this.child) {
        this._initialLocalChildPosition.copy(this.child.position);
      } else {
        this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(0.07);
      }
      const matrixWorldToCenter = this._getMatrixWorldToCenter();
      this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(matrixWorldToCenter);
      this._prevTail.copy(this._currentTail);
      this._boneAxis.copy(this._initialLocalChildPosition).normalize();
    }
    /**
     * Reset the state of this bone.
     * You might want to call {@link VRMSpringBoneManager.reset} instead.
     */
    reset() {
      this.bone.quaternion.copy(this._initialLocalRotation);
      this.bone.updateMatrix();
      this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
      const matrixWorldToCenter = this._getMatrixWorldToCenter();
      this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(matrixWorldToCenter);
      this._prevTail.copy(this._currentTail);
    }
    /**
     * Update the state of this bone.
     * You might want to call {@link VRMSpringBoneManager.update} instead.
     *
     * @param delta deltaTime
     */
    update(delta) {
      if (delta <= 0) return;
      this._calcWorldSpaceBoneLength();
      const worldSpaceBoneAxis = _v3B7.copy(this._boneAxis).transformDirection(this._initialLocalMatrix).transformDirection(this._parentMatrixWorld);
      _nextTail.copy(this._currentTail).add(_v3A16.subVectors(this._currentTail, this._prevTail).multiplyScalar(1 - this.settings.dragForce)).applyMatrix4(this._getMatrixCenterToWorld()).addScaledVector(worldSpaceBoneAxis, this.settings.stiffness * delta).addScaledVector(this.settings.gravityDir, this.settings.gravityPower * delta);
      _worldSpacePosition.setFromMatrixPosition(this.bone.matrixWorld);
      _nextTail.sub(_worldSpacePosition).normalize().multiplyScalar(this._worldSpaceBoneLength).add(_worldSpacePosition);
      this._collision(_nextTail);
      this._prevTail.copy(this._currentTail);
      this._currentTail.copy(_nextTail).applyMatrix4(this._getMatrixWorldToCenter());
      const worldSpaceInitialMatrixInv = _matA2.multiplyMatrices(this._parentMatrixWorld, this._initialLocalMatrix).invert();
      this.bone.quaternion.setFromUnitVectors(this._boneAxis, _v3A16.copy(_nextTail).applyMatrix4(worldSpaceInitialMatrixInv).normalize()).premultiply(this._initialLocalRotation);
      this.bone.updateMatrix();
      this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
    }
    /**
     * Do collision math against every colliders attached to this bone.
     *
     * @param tail The tail you want to process
     */
    _collision(tail) {
      for (let cg = 0; cg < this.colliderGroups.length; cg++) {
        for (let c = 0; c < this.colliderGroups[cg].colliders.length; c++) {
          const collider = this.colliderGroups[cg].colliders[c];
          const dist = collider.shape.calculateCollision(collider.colliderMatrix, tail, this.settings.hitRadius, _v3A16);
          if (dist < 0) {
            tail.addScaledVector(_v3A16, -dist);
            tail.sub(_worldSpacePosition);
            const length = tail.length();
            tail.multiplyScalar(this._worldSpaceBoneLength / length).add(_worldSpacePosition);
          }
        }
      }
    }
    /**
     * Calculate the {@link _worldSpaceBoneLength}.
     * Intended to be used in {@link update}.
     */
    _calcWorldSpaceBoneLength() {
      _v3A16.setFromMatrixPosition(this.bone.matrixWorld);
      if (this.child) {
        _v3B7.setFromMatrixPosition(this.child.matrixWorld);
      } else {
        _v3B7.copy(this._initialLocalChildPosition);
        _v3B7.applyMatrix4(this.bone.matrixWorld);
      }
      this._worldSpaceBoneLength = _v3A16.sub(_v3B7).length();
    }
    /**
     * Create a matrix that converts center space into world space.
     */
    _getMatrixCenterToWorld() {
      return this._center ? this._center.matrixWorld : IDENTITY_MATRIX4;
    }
    /**
     * Create a matrix that converts world space into center space.
     */
    _getMatrixWorldToCenter() {
      return this._center ? this._center.userData.inverseCacheProxy.inverse : IDENTITY_MATRIX4;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/utils/traverseAncestorsFromRoot.ts
  function traverseAncestorsFromRoot2(object, callback) {
    const ancestors = [];
    let head = object;
    while (head !== null) {
      ancestors.unshift(head);
      head = head.parent;
    }
    ancestors.forEach((ancestor) => {
      callback(ancestor);
    });
  }

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/utils/traverseChildrenUntilConditionMet.ts
  function traverseChildrenUntilConditionMet(object, callback) {
    object.children.forEach((child) => {
      const result = callback(child);
      if (!result) {
        traverseChildrenUntilConditionMet(child, callback);
      }
    });
  }

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/utils/lowestCommonAncestor.ts
  function lowestCommonAncestor(objects) {
    const sharedAncestors = /* @__PURE__ */ new Map();
    for (const object of objects) {
      let current = object;
      do {
        const newValue = (sharedAncestors.get(current) ?? 0) + 1;
        if (newValue === objects.size) {
          return current;
        }
        sharedAncestors.set(current, newValue);
        current = current.parent;
      } while (current !== null);
    }
    return null;
  }

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneManager.ts
  var VRMSpringBoneManager = class {
    constructor() {
      this._joints = /* @__PURE__ */ new Set();
      this._sortedJoints = [];
      this._hasWarnedCircularDependency = false;
      /**
       * An ordered list of ancestors of all the SpringBone joints. Before the
       * SpringBone joints can be updated, the world matrices of these ancestors
       * must be calculated. The first element is the lowest common ancestor, for
       * which not only its world matrix but its ancestors' world matrices are
       * updated as well.
       */
      this._ancestors = [];
      this._objectSpringBonesMap = /* @__PURE__ */ new Map();
      this._isSortedJointsDirty = false;
      this._relevantChildrenUpdated = this._relevantChildrenUpdated.bind(this);
    }
    get joints() {
      return this._joints;
    }
    /**
     * @deprecated Use {@link joints} instead.
     */
    get springBones() {
      console.warn("VRMSpringBoneManager: springBones is deprecated. use joints instead.");
      return this._joints;
    }
    get colliderGroups() {
      const set = /* @__PURE__ */ new Set();
      this._joints.forEach((springBone) => {
        springBone.colliderGroups.forEach((colliderGroup) => {
          set.add(colliderGroup);
        });
      });
      return Array.from(set);
    }
    get colliders() {
      const set = /* @__PURE__ */ new Set();
      this.colliderGroups.forEach((colliderGroup) => {
        colliderGroup.colliders.forEach((collider) => {
          set.add(collider);
        });
      });
      return Array.from(set);
    }
    addJoint(joint) {
      this._joints.add(joint);
      let objectSet = this._objectSpringBonesMap.get(joint.bone);
      if (objectSet == null) {
        objectSet = /* @__PURE__ */ new Set();
        this._objectSpringBonesMap.set(joint.bone, objectSet);
      }
      objectSet.add(joint);
      this._isSortedJointsDirty = true;
    }
    /**
     * @deprecated Use {@link addJoint} instead.
     */
    addSpringBone(joint) {
      console.warn("VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead.");
      this.addJoint(joint);
    }
    deleteJoint(joint) {
      this._joints.delete(joint);
      const objectSet = this._objectSpringBonesMap.get(joint.bone);
      objectSet.delete(joint);
      this._isSortedJointsDirty = true;
    }
    /**
     * @deprecated Use {@link deleteJoint} instead.
     */
    deleteSpringBone(joint) {
      console.warn("VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead.");
      this.deleteJoint(joint);
    }
    setInitState() {
      this._sortJoints();
      for (let i = 0; i < this._sortedJoints.length; i++) {
        const springBone = this._sortedJoints[i];
        springBone.bone.updateMatrix();
        springBone.bone.updateWorldMatrix(false, false);
        springBone.setInitState();
      }
    }
    reset() {
      this._sortJoints();
      for (let i = 0; i < this._sortedJoints.length; i++) {
        const springBone = this._sortedJoints[i];
        springBone.bone.updateMatrix();
        springBone.bone.updateWorldMatrix(false, false);
        springBone.reset();
      }
    }
    update(delta) {
      this._sortJoints();
      for (let i = 0; i < this._ancestors.length; i++) {
        this._ancestors[i].updateWorldMatrix(i === 0, false);
      }
      for (let i = 0; i < this._sortedJoints.length; i++) {
        const springBone = this._sortedJoints[i];
        springBone.bone.updateMatrix();
        springBone.bone.updateWorldMatrix(false, false);
        springBone.update(delta);
        traverseChildrenUntilConditionMet(springBone.bone, this._relevantChildrenUpdated);
      }
    }
    /**
     * Sorts the joints ensuring they are updated in the correct order taking dependencies into account.
     *
     * This method updates {@link _sortedJoints} and {@link _ancestors}.
     * Make sure to call this before using them.
     */
    _sortJoints() {
      if (!this._isSortedJointsDirty) {
        return;
      }
      const springBoneOrder = [];
      const springBonesTried = /* @__PURE__ */ new Set();
      const springBonesDone = /* @__PURE__ */ new Set();
      const ancestors = /* @__PURE__ */ new Set();
      for (const springBone of this._joints) {
        this._insertJointSort(springBone, springBonesTried, springBonesDone, springBoneOrder, ancestors);
      }
      this._sortedJoints = springBoneOrder;
      const lca = lowestCommonAncestor(ancestors);
      this._ancestors = [];
      if (lca) {
        this._ancestors.push(lca);
        traverseChildrenUntilConditionMet(lca, (object) => {
          if ((this._objectSpringBonesMap.get(object)?.size ?? 0) > 0) {
            return true;
          }
          this._ancestors.push(object);
          return false;
        });
      }
      this._isSortedJointsDirty = false;
    }
    _insertJointSort(springBone, springBonesTried, springBonesDone, springBoneOrder, ancestors) {
      if (springBonesDone.has(springBone)) {
        return;
      }
      if (springBonesTried.has(springBone)) {
        if (!this._hasWarnedCircularDependency) {
          console.warn("VRMSpringBoneManager: Circular dependency detected");
          this._hasWarnedCircularDependency = true;
        }
        return;
      }
      springBonesTried.add(springBone);
      const depObjects = springBone.dependencies;
      for (const depObject of depObjects) {
        let encounteredSpringBone = false;
        let ancestor = null;
        traverseAncestorsFromRoot2(depObject, (depObjectAncestor) => {
          const objectSet = this._objectSpringBonesMap.get(depObjectAncestor);
          if (objectSet) {
            for (const depSpringBone of objectSet) {
              encounteredSpringBone = true;
              this._insertJointSort(depSpringBone, springBonesTried, springBonesDone, springBoneOrder, ancestors);
            }
          } else if (!encounteredSpringBone) {
            ancestor = depObjectAncestor;
          }
        });
        if (ancestor) {
          ancestors.add(ancestor);
        }
      }
      springBoneOrder.push(springBone);
      springBonesDone.add(springBone);
    }
    _relevantChildrenUpdated(object) {
      if ((this._objectSpringBonesMap.get(object)?.size ?? 0) > 0) {
        return true;
      }
      object.updateWorldMatrix(false, false);
      return false;
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm-springbone/src/VRMSpringBoneLoaderPlugin.ts
  var EXTENSION_NAME_EXTENDED_COLLIDER = "VRMC_springBone_extended_collider";
  var POSSIBLE_SPEC_VERSIONS8 = /* @__PURE__ */ new Set(["1.0", "1.0-beta"]);
  var POSSIBLE_SPEC_VERSIONS_EXTENDED_COLLIDERS = /* @__PURE__ */ new Set(["1.0"]);
  var _VRMSpringBoneLoaderPlugin = class _VRMSpringBoneLoaderPlugin {
    get name() {
      return _VRMSpringBoneLoaderPlugin.EXTENSION_NAME;
    }
    constructor(parser, options) {
      this.parser = parser;
      this.jointHelperRoot = options?.jointHelperRoot;
      this.colliderHelperRoot = options?.colliderHelperRoot;
      this.useExtendedColliders = options?.useExtendedColliders ?? true;
    }
    async afterRoot(gltf) {
      gltf.userData.vrmSpringBoneManager = await this._import(gltf);
    }
    /**
     * Import spring bones from a GLTF and return a {@link VRMSpringBoneManager}.
     * It might return `null` instead when it does not need to be created or something go wrong.
     *
     * @param gltf A parsed result of GLTF taken from GLTFLoader
     */
    async _import(gltf) {
      const v1Result = await this._v1Import(gltf);
      if (v1Result != null) {
        return v1Result;
      }
      const v0Result = await this._v0Import(gltf);
      if (v0Result != null) {
        return v0Result;
      }
      return null;
    }
    async _v1Import(gltf) {
      const json = gltf.parser.json;
      const isSpringBoneUsed = json.extensionsUsed?.indexOf(_VRMSpringBoneLoaderPlugin.EXTENSION_NAME) !== -1;
      if (!isSpringBoneUsed) {
        return null;
      }
      const manager = new VRMSpringBoneManager();
      const threeNodes = await gltf.parser.getDependencies("node");
      const extension = json.extensions?.[_VRMSpringBoneLoaderPlugin.EXTENSION_NAME];
      if (!extension) {
        return null;
      }
      const specVersion = extension.specVersion;
      if (!POSSIBLE_SPEC_VERSIONS8.has(specVersion)) {
        console.warn(
          `VRMSpringBoneLoaderPlugin: Unknown ${_VRMSpringBoneLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`
        );
        return null;
      }
      const colliders = extension.colliders?.map((schemaCollider, iCollider) => {
        const node = threeNodes[schemaCollider.node];
        if (node == null) {
          console.warn(
            `VRMSpringBoneLoaderPlugin: The collider #${iCollider} attempted to reference a node #${schemaCollider.node} but not found. Skipping the collider`
          );
          return null;
        }
        const schemaShape = schemaCollider.shape;
        const schemaExCollider = schemaCollider.extensions?.[EXTENSION_NAME_EXTENDED_COLLIDER];
        if (this.useExtendedColliders && schemaExCollider != null) {
          const specVersionExCollider = schemaExCollider.specVersion;
          if (!POSSIBLE_SPEC_VERSIONS_EXTENDED_COLLIDERS.has(specVersionExCollider)) {
            console.warn(
              `VRMSpringBoneLoaderPlugin: Unknown ${EXTENSION_NAME_EXTENDED_COLLIDER} specVersion "${specVersionExCollider}". Fallbacking to the ${_VRMSpringBoneLoaderPlugin.EXTENSION_NAME} definition`
            );
          } else {
            const schemaExShape = schemaExCollider.shape;
            if (schemaExShape.sphere) {
              return this._importSphereCollider(node, {
                offset: new Vector3().fromArray(schemaExShape.sphere.offset ?? [0, 0, 0]),
                radius: schemaExShape.sphere.radius ?? 0,
                inside: schemaExShape.sphere.inside ?? false
              });
            } else if (schemaExShape.capsule) {
              return this._importCapsuleCollider(node, {
                offset: new Vector3().fromArray(schemaExShape.capsule.offset ?? [0, 0, 0]),
                radius: schemaExShape.capsule.radius ?? 0,
                tail: new Vector3().fromArray(schemaExShape.capsule.tail ?? [0, 0, 0]),
                inside: schemaExShape.capsule.inside ?? false
              });
            } else if (schemaExShape.plane) {
              return this._importPlaneCollider(node, {
                offset: new Vector3().fromArray(schemaExShape.plane.offset ?? [0, 0, 0]),
                normal: new Vector3().fromArray(schemaExShape.plane.normal ?? [0, 0, 1])
              });
            }
          }
        }
        if (schemaShape.sphere) {
          return this._importSphereCollider(node, {
            offset: new Vector3().fromArray(schemaShape.sphere.offset ?? [0, 0, 0]),
            radius: schemaShape.sphere.radius ?? 0,
            inside: false
          });
        } else if (schemaShape.capsule) {
          return this._importCapsuleCollider(node, {
            offset: new Vector3().fromArray(schemaShape.capsule.offset ?? [0, 0, 0]),
            radius: schemaShape.capsule.radius ?? 0,
            tail: new Vector3().fromArray(schemaShape.capsule.tail ?? [0, 0, 0]),
            inside: false
          });
        }
        console.warn(`VRMSpringBoneLoaderPlugin: The collider #${iCollider} has no valid shape. Skipping the collider`);
      });
      const colliderGroups = extension.colliderGroups?.map(
        (schemaColliderGroup, iColliderGroup) => {
          const cols = (schemaColliderGroup.colliders ?? []).map((iCollider) => {
            const col = colliders?.[iCollider];
            if (col == null) {
              console.warn(
                `VRMSpringBoneLoaderPlugin: The collider group #${iColliderGroup} attempted to reference a collider #${iCollider} but not found. Skipping the collider`
              );
              return null;
            }
            return col;
          }).filter((col) => col != null);
          return {
            colliders: cols,
            name: schemaColliderGroup.name
          };
        }
      );
      extension.springs?.forEach((schemaSpring, iSpring) => {
        const schemaJoints = schemaSpring.joints;
        if (schemaJoints == null) {
          console.warn(`VRMSpringBoneLoaderPlugin: The spring #${iSpring} has no joints. Skipping the spring`);
          return;
        }
        const colliderGroupsForSpring = schemaSpring.colliderGroups?.map((iColliderGroup) => {
          const group = colliderGroups?.[iColliderGroup];
          if (group == null) {
            console.warn(
              `VRMSpringBoneLoaderPlugin: The spring #${iSpring} attempted to reference a collider group #${iColliderGroup} but not found. Skipping the collider group`
            );
            return null;
          }
          return group;
        }).filter((group) => group != null);
        const center = schemaSpring.center != null ? threeNodes[schemaSpring.center] : void 0;
        let prevSchemaJoint;
        schemaJoints.forEach((schemaJoint) => {
          if (prevSchemaJoint) {
            const nodeIndex = prevSchemaJoint.node;
            const node = threeNodes[nodeIndex];
            const childIndex = schemaJoint.node;
            const child = threeNodes[childIndex];
            const setting = {
              hitRadius: prevSchemaJoint.hitRadius,
              dragForce: prevSchemaJoint.dragForce,
              gravityPower: prevSchemaJoint.gravityPower,
              stiffness: prevSchemaJoint.stiffness,
              gravityDir: prevSchemaJoint.gravityDir != null ? new Vector3().fromArray(prevSchemaJoint.gravityDir) : void 0
            };
            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
            if (center) {
              joint.center = center;
            }
            manager.addJoint(joint);
          }
          prevSchemaJoint = schemaJoint;
        });
      });
      manager.setInitState();
      return manager;
    }
    async _v0Import(gltf) {
      const json = gltf.parser.json;
      const isVRMUsed = json.extensionsUsed?.indexOf("VRM") !== -1;
      if (!isVRMUsed) {
        return null;
      }
      const extension = json.extensions?.["VRM"];
      const schemaSecondaryAnimation = extension?.secondaryAnimation;
      if (!schemaSecondaryAnimation) {
        return null;
      }
      const schemaBoneGroups = schemaSecondaryAnimation?.boneGroups;
      if (!schemaBoneGroups) {
        return null;
      }
      const manager = new VRMSpringBoneManager();
      const threeNodes = await gltf.parser.getDependencies("node");
      const colliderGroups = schemaSecondaryAnimation.colliderGroups?.map(
        (schemaColliderGroup, iColliderGroup) => {
          const node = threeNodes[schemaColliderGroup.node];
          if (node == null) {
            console.warn(
              `VRMSpringBoneLoaderPlugin: The collider group #${iColliderGroup} attempted to reference a node #${schemaColliderGroup.node} but not found. Skipping the collider group`
            );
            return null;
          }
          const colliders = (schemaColliderGroup.colliders ?? []).map((schemaCollider, iCollider) => {
            const offset = new Vector3(0, 0, 0);
            if (schemaCollider.offset) {
              offset.set(
                schemaCollider.offset.x ?? 0,
                schemaCollider.offset.y ?? 0,
                schemaCollider.offset.z ? -schemaCollider.offset.z : 0
                // z is opposite in VRM0.0
              );
            }
            return this._importSphereCollider(node, {
              offset,
              radius: schemaCollider.radius ?? 0,
              inside: false
            });
          });
          return { colliders };
        }
      );
      schemaBoneGroups?.forEach((schemaBoneGroup, iBoneGroup) => {
        const rootIndices = schemaBoneGroup.bones;
        if (!rootIndices) {
          return;
        }
        rootIndices.forEach((rootIndex) => {
          const root = threeNodes[rootIndex];
          if (root == null) {
            console.warn(
              `VRMSpringBoneLoaderPlugin: The spring bone group #${iBoneGroup} attempted to reference a node #${rootIndex} but not found. Skipping the node`
            );
            return;
          }
          const gravityDir = new Vector3();
          if (schemaBoneGroup.gravityDir) {
            gravityDir.set(
              schemaBoneGroup.gravityDir.x ?? 0,
              schemaBoneGroup.gravityDir.y ?? 0,
              schemaBoneGroup.gravityDir.z ?? 0
            );
          } else {
            gravityDir.set(0, -1, 0);
          }
          const center = schemaBoneGroup.center != null ? threeNodes[schemaBoneGroup.center] : void 0;
          const setting = {
            hitRadius: schemaBoneGroup.hitRadius,
            dragForce: schemaBoneGroup.dragForce,
            gravityPower: schemaBoneGroup.gravityPower,
            stiffness: schemaBoneGroup.stiffiness,
            gravityDir
          };
          const colliderGroupsForSpring = schemaBoneGroup.colliderGroups?.map((iColliderGroup) => {
            const group = colliderGroups?.[iColliderGroup];
            if (group == null) {
              console.warn(
                `VRMSpringBoneLoaderPlugin: The spring #${iBoneGroup} attempted to reference a collider group #${iColliderGroup} but not found. Skipping the collider group`
              );
              return null;
            }
            return group;
          }).filter((group) => group != null);
          root.traverse((node) => {
            const child = node.children[0] ?? null;
            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
            if (center) {
              joint.center = center;
            }
            manager.addJoint(joint);
          });
        });
      });
      gltf.scene.updateMatrixWorld();
      manager.setInitState();
      return manager;
    }
    _importJoint(node, child, setting, colliderGroupsForSpring) {
      const springBone = new VRMSpringBoneJoint(node, child, setting, colliderGroupsForSpring);
      if (this.jointHelperRoot) {
        const helper = new VRMSpringBoneJointHelper(springBone);
        this.jointHelperRoot.add(helper);
        helper.renderOrder = this.jointHelperRoot.renderOrder;
      }
      return springBone;
    }
    _importSphereCollider(destination, params) {
      const shape = new VRMSpringBoneColliderShapeSphere(params);
      const collider = new VRMSpringBoneCollider(shape);
      destination.add(collider);
      if (this.colliderHelperRoot) {
        const helper = new VRMSpringBoneColliderHelper(collider);
        this.colliderHelperRoot.add(helper);
        helper.renderOrder = this.colliderHelperRoot.renderOrder;
      }
      return collider;
    }
    _importCapsuleCollider(destination, params) {
      const shape = new VRMSpringBoneColliderShapeCapsule(params);
      const collider = new VRMSpringBoneCollider(shape);
      destination.add(collider);
      if (this.colliderHelperRoot) {
        const helper = new VRMSpringBoneColliderHelper(collider);
        this.colliderHelperRoot.add(helper);
        helper.renderOrder = this.colliderHelperRoot.renderOrder;
      }
      return collider;
    }
    _importPlaneCollider(destination, params) {
      const shape = new VRMSpringBoneColliderShapePlane(params);
      const collider = new VRMSpringBoneCollider(shape);
      destination.add(collider);
      if (this.colliderHelperRoot) {
        const helper = new VRMSpringBoneColliderHelper(collider);
        this.colliderHelperRoot.add(helper);
        helper.renderOrder = this.colliderHelperRoot.renderOrder;
      }
      return collider;
    }
  };
  _VRMSpringBoneLoaderPlugin.EXTENSION_NAME = "VRMC_springBone";
  var VRMSpringBoneLoaderPlugin = _VRMSpringBoneLoaderPlugin;

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMLoaderPlugin.ts
  var VRMLoaderPlugin = class {
    get name() {
      return "VRMLoaderPlugin";
    }
    constructor(parser, options) {
      this.parser = parser;
      const helperRoot = options?.helperRoot;
      const autoUpdateHumanBones = options?.autoUpdateHumanBones;
      this.expressionPlugin = options?.expressionPlugin ?? new VRMExpressionLoaderPlugin(parser);
      this.firstPersonPlugin = options?.firstPersonPlugin ?? new VRMFirstPersonLoaderPlugin(parser);
      this.humanoidPlugin = options?.humanoidPlugin ?? new VRMHumanoidLoaderPlugin(parser, {
        helperRoot,
        autoUpdateHumanBones
      });
      this.lookAtPlugin = options?.lookAtPlugin ?? new VRMLookAtLoaderPlugin(parser, { helperRoot });
      this.metaPlugin = options?.metaPlugin ?? new VRMMetaLoaderPlugin(parser);
      this.mtoonMaterialPlugin = options?.mtoonMaterialPlugin ?? new MToonMaterialLoaderPlugin(parser);
      this.materialsHDREmissiveMultiplierPlugin = options?.materialsHDREmissiveMultiplierPlugin ?? new VRMMaterialsHDREmissiveMultiplierLoaderPlugin(parser);
      this.materialsV0CompatPlugin = options?.materialsV0CompatPlugin ?? new VRMMaterialsV0CompatPlugin(parser);
      this.springBonePlugin = options?.springBonePlugin ?? new VRMSpringBoneLoaderPlugin(parser, {
        colliderHelperRoot: helperRoot,
        jointHelperRoot: helperRoot
      });
      this.nodeConstraintPlugin = options?.nodeConstraintPlugin ?? new VRMNodeConstraintLoaderPlugin(parser, { helperRoot });
    }
    async beforeRoot() {
      await this.materialsV0CompatPlugin.beforeRoot();
      await this.mtoonMaterialPlugin.beforeRoot();
    }
    async loadMesh(meshIndex) {
      return await this.mtoonMaterialPlugin.loadMesh(meshIndex);
    }
    getMaterialType(materialIndex) {
      const mtoonType = this.mtoonMaterialPlugin.getMaterialType(materialIndex);
      if (mtoonType != null) {
        return mtoonType;
      }
      return null;
    }
    async extendMaterialParams(materialIndex, materialParams) {
      await this.materialsHDREmissiveMultiplierPlugin.extendMaterialParams(materialIndex, materialParams);
      await this.mtoonMaterialPlugin.extendMaterialParams(materialIndex, materialParams);
    }
    async afterRoot(gltf) {
      await this.metaPlugin.afterRoot(gltf);
      await this.humanoidPlugin.afterRoot(gltf);
      await this.expressionPlugin.afterRoot(gltf);
      await this.lookAtPlugin.afterRoot(gltf);
      await this.firstPersonPlugin.afterRoot(gltf);
      await this.springBonePlugin.afterRoot(gltf);
      await this.nodeConstraintPlugin.afterRoot(gltf);
      await this.mtoonMaterialPlugin.afterRoot(gltf);
      const meta = gltf.userData.vrmMeta;
      const humanoid = gltf.userData.vrmHumanoid;
      if (meta && humanoid) {
        const vrm = new VRM({
          scene: gltf.scene,
          expressionManager: gltf.userData.vrmExpressionManager,
          firstPerson: gltf.userData.vrmFirstPerson,
          humanoid,
          lookAt: gltf.userData.vrmLookAt,
          meta,
          materials: gltf.userData.vrmMToonMaterials,
          springBoneManager: gltf.userData.vrmSpringBoneManager,
          nodeConstraintManager: gltf.userData.vrmNodeConstraintManager
        });
        gltf.userData.vrm = vrm;
      }
    }
  };

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/combineMorphs.ts
  function collectMeshes(scene) {
    const meshes = /* @__PURE__ */ new Set();
    scene.traverse((obj) => {
      if (!obj.isMesh) {
        return;
      }
      const mesh = obj;
      meshes.add(mesh);
    });
    return meshes;
  }
  function combineMorph(positionAttributes, binds, morphTargetsRelative) {
    if (binds.size === 1) {
      const bind = binds.values().next().value;
      if (bind.weight === 1) {
        return positionAttributes[bind.index];
      }
    }
    const newArray = new Float32Array(positionAttributes[0].count * 3);
    let weightSum = 0;
    if (morphTargetsRelative) {
      weightSum = 1;
    } else {
      for (const bind of binds) {
        weightSum += bind.weight;
      }
    }
    for (const bind of binds) {
      const src = positionAttributes[bind.index];
      const weight = bind.weight / weightSum;
      for (let i = 0; i < src.count; i++) {
        newArray[i * 3 + 0] += src.getX(i) * weight;
        newArray[i * 3 + 1] += src.getY(i) * weight;
        newArray[i * 3 + 2] += src.getZ(i) * weight;
      }
    }
    const newAttribute = new BufferAttribute(newArray, 3);
    return newAttribute;
  }
  function combineMorphs(vrm) {
    const meshes = collectMeshes(vrm.scene);
    const meshNameBindSetMapMap = /* @__PURE__ */ new Map();
    const expressionMap = vrm.expressionManager?.expressionMap;
    if (expressionMap != null) {
      for (const [expressionName, expression] of Object.entries(expressionMap)) {
        const bindsToDeleteSet = /* @__PURE__ */ new Set();
        for (const bind of expression.binds) {
          if (bind instanceof VRMExpressionMorphTargetBind) {
            if (bind.weight !== 0) {
              for (const mesh of bind.primitives) {
                let nameBindSetMap = meshNameBindSetMapMap.get(mesh);
                if (nameBindSetMap == null) {
                  nameBindSetMap = /* @__PURE__ */ new Map();
                  meshNameBindSetMapMap.set(mesh, nameBindSetMap);
                }
                let bindSet = nameBindSetMap.get(expressionName);
                if (bindSet == null) {
                  bindSet = /* @__PURE__ */ new Set();
                  nameBindSetMap.set(expressionName, bindSet);
                }
                bindSet.add(bind);
              }
            }
            bindsToDeleteSet.add(bind);
          }
        }
        for (const bind of bindsToDeleteSet) {
          expression.deleteBind(bind);
        }
      }
    }
    for (const mesh of meshes) {
      const nameBindSetMap = meshNameBindSetMapMap.get(mesh);
      if (nameBindSetMap == null) {
        continue;
      }
      const originalMorphAttributes = mesh.geometry.morphAttributes;
      mesh.geometry.morphAttributes = {};
      const geometry = mesh.geometry.clone();
      mesh.geometry = geometry;
      const morphTargetsRelative = geometry.morphTargetsRelative;
      const hasPMorph = originalMorphAttributes.position != null;
      const hasNMorph = originalMorphAttributes.normal != null;
      const morphAttributes = {};
      const morphTargetDictionary = {};
      const morphTargetInfluences = [];
      if (hasPMorph || hasNMorph) {
        if (hasPMorph) {
          morphAttributes.position = [];
        }
        if (hasNMorph) {
          morphAttributes.normal = [];
        }
        let i = 0;
        for (const [name, bindSet] of nameBindSetMap) {
          if (hasPMorph) {
            morphAttributes.position[i] = combineMorph(originalMorphAttributes.position, bindSet, morphTargetsRelative);
          }
          if (hasNMorph) {
            morphAttributes.normal[i] = combineMorph(originalMorphAttributes.normal, bindSet, morphTargetsRelative);
          }
          expressionMap?.[name].addBind(
            new VRMExpressionMorphTargetBind({
              index: i,
              weight: 1,
              primitives: [mesh]
            })
          );
          morphTargetDictionary[name] = i;
          morphTargetInfluences.push(0);
          i++;
        }
      }
      geometry.morphAttributes = morphAttributes;
      mesh.morphTargetDictionary = morphTargetDictionary;
      mesh.morphTargetInfluences = morphTargetInfluences;
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/utils/attributeGetComponentCompat.ts
  function attributeGetComponentCompat(attribute, index, component) {
    if (attribute.getComponent) {
      return attribute.getComponent(index, component);
    } else {
      let value = attribute.array[index * attribute.itemSize + component];
      if (attribute.normalized) {
        value = MathUtils.denormalize(value, attribute.array);
      }
      return value;
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/utils/attributeSetComponentCompat.ts
  function attributeSetComponentCompat(attribute, index, component, value) {
    if (attribute.setComponent) {
      attribute.setComponent(index, component, value);
    } else {
      if (attribute.normalized) {
        value = MathUtils.normalize(value, attribute.array);
      }
      attribute.array[index * attribute.itemSize + component] = value;
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/combineSkeletons.ts
  function combineSkeletons(root) {
    const skinnedMeshes = collectSkinnedMeshes(root);
    const geometries = /* @__PURE__ */ new Set();
    for (const mesh of skinnedMeshes) {
      if (geometries.has(mesh.geometry)) {
        mesh.geometry = shallowCloneBufferGeometry(mesh.geometry);
      }
      geometries.add(mesh.geometry);
    }
    const attributeUsedIndexSetMap = /* @__PURE__ */ new Map();
    for (const geometry of geometries) {
      const skinIndexAttr = geometry.getAttribute("skinIndex");
      const skinIndexMap = attributeUsedIndexSetMap.get(skinIndexAttr) ?? /* @__PURE__ */ new Map();
      attributeUsedIndexSetMap.set(skinIndexAttr, skinIndexMap);
      const skinWeightAttr = geometry.getAttribute("skinWeight");
      const usedIndicesSet = listUsedIndices(skinIndexAttr, skinWeightAttr);
      skinIndexMap.set(skinWeightAttr, usedIndicesSet);
    }
    const meshBoneInverseMapMap = /* @__PURE__ */ new Map();
    for (const mesh of skinnedMeshes) {
      const boneInverseMap = listUsedBones(mesh, attributeUsedIndexSetMap);
      meshBoneInverseMapMap.set(mesh, boneInverseMap);
    }
    const groups = [];
    for (const [mesh, boneInverseMap] of meshBoneInverseMapMap) {
      let foundMergeableGroup = false;
      for (const candidate of groups) {
        const isMergeable = boneInverseMapIsMergeable(boneInverseMap, candidate.boneInverseMap);
        if (isMergeable) {
          foundMergeableGroup = true;
          candidate.meshes.add(mesh);
          for (const [bone, boneInverse] of boneInverseMap) {
            candidate.boneInverseMap.set(bone, boneInverse);
          }
          break;
        }
      }
      if (!foundMergeableGroup) {
        groups.push({ boneInverseMap, meshes: /* @__PURE__ */ new Set([mesh]) });
      }
    }
    const cache = /* @__PURE__ */ new Map();
    const skinIndexDispatcher = new ObjectIndexDispatcher();
    const skeletonDispatcher = new ObjectIndexDispatcher();
    const boneDispatcher = new ObjectIndexDispatcher();
    for (const group of groups) {
      const { boneInverseMap, meshes } = group;
      const newBones = Array.from(boneInverseMap.keys());
      const newBoneInverses = Array.from(boneInverseMap.values());
      const newSkeleton = new Skeleton(newBones, newBoneInverses);
      const skeletonKey = skeletonDispatcher.getOrCreate(newSkeleton);
      for (const mesh of meshes) {
        const skinIndexAttr = mesh.geometry.getAttribute("skinIndex");
        const skinIndexKey = skinIndexDispatcher.getOrCreate(skinIndexAttr);
        const bones = mesh.skeleton.bones;
        const bonesKey = bones.map((bone) => boneDispatcher.getOrCreate(bone)).join(",");
        const key = `${skinIndexKey};${skeletonKey};${bonesKey}`;
        let newSkinIndexAttr = cache.get(key);
        if (newSkinIndexAttr == null) {
          newSkinIndexAttr = skinIndexAttr.clone();
          remapSkinIndexAttribute(newSkinIndexAttr, bones, newBones);
          cache.set(key, newSkinIndexAttr);
        }
        mesh.geometry.setAttribute("skinIndex", newSkinIndexAttr);
      }
      for (const mesh of meshes) {
        mesh.bind(newSkeleton, new Matrix4());
      }
    }
  }
  function collectSkinnedMeshes(scene) {
    const skinnedMeshes = /* @__PURE__ */ new Set();
    scene.traverse((obj) => {
      if (!obj.isSkinnedMesh) {
        return;
      }
      const skinnedMesh = obj;
      skinnedMeshes.add(skinnedMesh);
    });
    return skinnedMeshes;
  }
  function listUsedIndices(skinIndexAttr, skinWeightAttr) {
    const usedIndices = /* @__PURE__ */ new Set();
    for (let i = 0; i < skinIndexAttr.count; i++) {
      for (let j = 0; j < skinIndexAttr.itemSize; j++) {
        const index = attributeGetComponentCompat(skinIndexAttr, i, j);
        const weight = attributeGetComponentCompat(skinWeightAttr, i, j);
        if (weight !== 0) {
          usedIndices.add(index);
        }
      }
    }
    return usedIndices;
  }
  function listUsedBones(mesh, attributeUsedIndexSetMap) {
    const boneInverseMap = /* @__PURE__ */ new Map();
    const skeleton = mesh.skeleton;
    const geometry = mesh.geometry;
    const skinIndexAttr = geometry.getAttribute("skinIndex");
    const skinWeightAttr = geometry.getAttribute("skinWeight");
    const skinIndexMap = attributeUsedIndexSetMap.get(skinIndexAttr);
    const usedIndicesSet = skinIndexMap?.get(skinWeightAttr);
    if (!usedIndicesSet) {
      throw new Error(
        "Unreachable. attributeUsedIndexSetMap does not know the skin index attribute or the skin weight attribute."
      );
    }
    for (const index of usedIndicesSet) {
      boneInverseMap.set(skeleton.bones[index], skeleton.boneInverses[index]);
    }
    return boneInverseMap;
  }
  function boneInverseMapIsMergeable(toCheck, candidate) {
    for (const [bone, boneInverse] of toCheck.entries()) {
      const candidateBoneInverse = candidate.get(bone);
      if (candidateBoneInverse != null) {
        if (!matrixEquals(boneInverse, candidateBoneInverse)) {
          return false;
        }
      }
    }
    return true;
  }
  function remapSkinIndexAttribute(attribute, oldBones, newBones) {
    const boneOldIndexMap = /* @__PURE__ */ new Map();
    for (const bone of oldBones) {
      boneOldIndexMap.set(bone, boneOldIndexMap.size);
    }
    const oldToNew = /* @__PURE__ */ new Map();
    for (const [i, bone] of newBones.entries()) {
      const oldIndex = boneOldIndexMap.get(bone);
      oldToNew.set(oldIndex, i);
    }
    for (let i = 0; i < attribute.count; i++) {
      for (let j = 0; j < attribute.itemSize; j++) {
        const oldIndex = attributeGetComponentCompat(attribute, i, j);
        const newIndex = oldToNew.get(oldIndex);
        attributeSetComponentCompat(attribute, i, j, newIndex);
      }
    }
    attribute.needsUpdate = true;
  }
  function matrixEquals(a, b, tolerance) {
    tolerance = tolerance || 1e-4;
    if (a.elements.length != b.elements.length) {
      return false;
    }
    for (let i = 0, il = a.elements.length; i < il; i++) {
      const delta = Math.abs(a.elements[i] - b.elements[i]);
      if (delta > tolerance) {
        return false;
      }
    }
    return true;
  }
  var ObjectIndexDispatcher = class {
    constructor() {
      this._objectIndexMap = /* @__PURE__ */ new Map();
      this._index = 0;
    }
    get(obj) {
      return this._objectIndexMap.get(obj);
    }
    getOrCreate(obj) {
      let index = this._objectIndexMap.get(obj);
      if (index == null) {
        index = this._index;
        this._objectIndexMap.set(obj, index);
        this._index++;
      }
      return index;
    }
  };
  function shallowCloneBufferGeometry(geometry) {
    const clone = new BufferGeometry();
    clone.name = geometry.name;
    clone.setIndex(geometry.index);
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      clone.setAttribute(name, attribute);
    }
    for (const [key, morphAttributes] of Object.entries(geometry.morphAttributes)) {
      const attributeName = key;
      clone.morphAttributes[attributeName] = morphAttributes.concat();
    }
    clone.morphTargetsRelative = geometry.morphTargetsRelative;
    clone.groups = [];
    for (const group of geometry.groups) {
      clone.addGroup(group.start, group.count, group.materialIndex);
    }
    clone.boundingSphere = geometry.boundingSphere?.clone() ?? null;
    clone.boundingBox = geometry.boundingBox?.clone() ?? null;
    clone.drawRange.start = geometry.drawRange.start;
    clone.drawRange.count = geometry.drawRange.count;
    clone.userData = geometry.userData;
    return clone;
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/deepDispose.ts
  function disposeMaterial(material) {
    Object.values(material).forEach((value) => {
      if (value?.isTexture) {
        const texture = value;
        texture.dispose();
      }
    });
    if (material.isShaderMaterial) {
      const uniforms = material.uniforms;
      if (uniforms) {
        Object.values(uniforms).forEach((uniform) => {
          const value = uniform.value;
          if (value?.isTexture) {
            const texture = value;
            texture.dispose();
          }
        });
      }
    }
    material.dispose();
  }
  function dispose(object3D) {
    const geometry = object3D.geometry;
    if (geometry) {
      geometry.dispose();
    }
    const skeleton = object3D.skeleton;
    if (skeleton) {
      skeleton.dispose();
    }
    const material = object3D.material;
    if (material) {
      if (Array.isArray(material)) {
        material.forEach((material2) => disposeMaterial(material2));
      } else if (material) {
        disposeMaterial(material);
      }
    }
  }
  function deepDispose(object3D) {
    object3D.traverse(dispose);
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/removeUnnecessaryJoints.ts
  function removeUnnecessaryJoints(root, options) {
    console.warn(
      "VRMUtils.removeUnnecessaryJoints: removeUnnecessaryJoints is deprecated. Use combineSkeletons instead. combineSkeletons contributes more to the performance improvement. This function will be removed in the next major version."
    );
    const experimentalSameBoneCounts = options?.experimentalSameBoneCounts ?? false;
    const skinnedMeshes = [];
    root.traverse((obj) => {
      if (obj.type !== "SkinnedMesh") {
        return;
      }
      skinnedMeshes.push(obj);
    });
    const attributeToBoneIndexMapMap = /* @__PURE__ */ new Map();
    let maxBones = 0;
    for (const mesh of skinnedMeshes) {
      const geometry = mesh.geometry;
      const attribute = geometry.getAttribute("skinIndex");
      if (attributeToBoneIndexMapMap.has(attribute)) {
        continue;
      }
      const oldToNew = /* @__PURE__ */ new Map();
      const newToOld = /* @__PURE__ */ new Map();
      for (let i = 0; i < attribute.count; i++) {
        for (let j = 0; j < attribute.itemSize; j++) {
          const oldIndex = attributeGetComponentCompat(attribute, i, j);
          let newIndex = oldToNew.get(oldIndex);
          if (newIndex == null) {
            newIndex = oldToNew.size;
            oldToNew.set(oldIndex, newIndex);
            newToOld.set(newIndex, oldIndex);
          }
          attributeSetComponentCompat(attribute, i, j, newIndex);
        }
      }
      attribute.needsUpdate = true;
      attributeToBoneIndexMapMap.set(attribute, newToOld);
      maxBones = Math.max(maxBones, oldToNew.size);
    }
    for (const mesh of skinnedMeshes) {
      const geometry = mesh.geometry;
      const attribute = geometry.getAttribute("skinIndex");
      const newToOld = attributeToBoneIndexMapMap.get(attribute);
      const bones = [];
      const boneInverses = [];
      const nBones = experimentalSameBoneCounts ? maxBones : newToOld.size;
      for (let newIndex = 0; newIndex < nBones; newIndex++) {
        const oldIndex = newToOld.get(newIndex) ?? 0;
        bones.push(mesh.skeleton.bones[oldIndex]);
        boneInverses.push(mesh.skeleton.boneInverses[oldIndex]);
      }
      const skeleton = new Skeleton(bones, boneInverses);
      mesh.bind(skeleton, new Matrix4());
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/removeUnnecessaryVertices.ts
  function checkIsVertexUsed(attributes, originalIndex) {
    const vertexCount = attributes.position.count;
    const isVertexUsed = new Array(vertexCount);
    let verticesUsed = 0;
    const originalIndexArray = originalIndex.array;
    for (let i = 0; i < originalIndexArray.length; i++) {
      const index = originalIndexArray[i];
      if (!isVertexUsed[index]) {
        isVertexUsed[index] = true;
        verticesUsed++;
      }
    }
    return { isVertexUsed, vertexCount, verticesUsed };
  }
  function buildIndexMapsFromIsVertexUsed(isVertexUsed) {
    const originalIndexNewIndexMap = [];
    const newIndexOriginalIndexMap = [];
    let indexHead = 0;
    for (let i = 0; i < isVertexUsed.length; i++) {
      if (isVertexUsed[i]) {
        const newIndex = indexHead++;
        originalIndexNewIndexMap[i] = newIndex;
        newIndexOriginalIndexMap[newIndex] = i;
      }
    }
    return { originalIndexNewIndexMap, newIndexOriginalIndexMap };
  }
  function copyGeometryProperties(source, target) {
    target.name = source.name;
    target.morphTargetsRelative = source.morphTargetsRelative;
    source.groups.forEach((group) => {
      target.addGroup(group.start, group.count, group.materialIndex);
    });
    target.boundingBox = source.boundingBox?.clone() ?? null;
    target.boundingSphere = source.boundingSphere?.clone() ?? null;
    target.setDrawRange(source.drawRange.start, source.drawRange.count);
    target.userData = source.userData;
  }
  function reorganizeIndexAttribute(newGeometry, originalIndex, originalIndexNewIndexMap) {
    const originalIndexArray = originalIndex.array;
    const newIndexArray = new originalIndexArray.constructor(originalIndexArray.length);
    for (let i = 0; i < originalIndexArray.length; i++) {
      const index = originalIndexArray[i];
      newIndexArray[i] = originalIndexNewIndexMap[index];
    }
    newGeometry.setIndex(new BufferAttribute(newIndexArray, originalIndex.itemSize, originalIndex.normalized));
  }
  function remapAttributeArray(originalArray, newIndexOriginalIndexMap, stride) {
    const ArrayCtor = originalArray.constructor;
    const newArray = new ArrayCtor(newIndexOriginalIndexMap.length * stride);
    let isAllZero = true;
    for (let i = 0; i < newIndexOriginalIndexMap.length; i++) {
      const originalIndex = newIndexOriginalIndexMap[i];
      const srcBase = originalIndex * stride;
      const dstBase = i * stride;
      for (let j = 0; j < stride; j++) {
        const v = originalArray[srcBase + j];
        newArray[dstBase + j] = v;
        isAllZero = isAllZero && v === 0;
      }
    }
    return [newArray, isAllZero];
  }
  function collectGeometryAttributeGroups(attributes) {
    const interleavedBufferAttributeMap = /* @__PURE__ */ new Map();
    const nonInterleavedAttributes = [];
    for (const [attributeName, originalAttribute] of Object.entries(attributes)) {
      if (originalAttribute.isInterleavedBufferAttribute) {
        const interleavedAttribute = originalAttribute;
        const interleavedBuffer = interleavedAttribute.data;
        const group = interleavedBufferAttributeMap.get(interleavedBuffer) ?? [];
        interleavedBufferAttributeMap.set(interleavedBuffer, group);
        group.push([attributeName, interleavedAttribute]);
      } else {
        const attribute = originalAttribute;
        nonInterleavedAttributes.push([attributeName, attribute]);
      }
    }
    return [interleavedBufferAttributeMap, nonInterleavedAttributes];
  }
  function reorganizeGeometryAttributes(newGeometry, attributes, newIndexOriginalIndexMap) {
    const [interleavedBufferAttributeMap, nonInterleavedAttributes] = collectGeometryAttributeGroups(attributes);
    for (const [interleavedBuffer, attributesInGroup] of interleavedBufferAttributeMap) {
      const originalInterleavedBufferArray = interleavedBuffer.array;
      const { stride } = interleavedBuffer;
      const [newInterleavedArray, _] = remapAttributeArray(
        originalInterleavedBufferArray,
        newIndexOriginalIndexMap,
        stride
      );
      const newInterleavedBuffer = new InterleavedBuffer(newInterleavedArray, stride);
      newInterleavedBuffer.setUsage(interleavedBuffer.usage);
      for (const [attributeName, originalAttribute] of attributesInGroup) {
        const { itemSize, offset, normalized } = originalAttribute;
        const newAttribute = new InterleavedBufferAttribute(newInterleavedBuffer, itemSize, offset, normalized);
        newGeometry.setAttribute(attributeName, newAttribute);
      }
    }
    for (const [attributeName, originalAttribute] of nonInterleavedAttributes) {
      const originalAttributeArray = originalAttribute.array;
      const { itemSize, normalized } = originalAttribute;
      const [newAttributeArray, _] = remapAttributeArray(originalAttributeArray, newIndexOriginalIndexMap, itemSize);
      newGeometry.setAttribute(attributeName, new BufferAttribute(newAttributeArray, itemSize, normalized));
    }
  }
  function collectMorphAttributeGroups(morphAttributes) {
    const interleavedBufferAttributeMap = /* @__PURE__ */ new Map();
    const nonInterleavedAttributes = [];
    for (const [key, attributes] of Object.entries(morphAttributes)) {
      const attributeName = key;
      for (let iMorph = 0; iMorph < attributes.length; iMorph++) {
        const originalAttribute = attributes[iMorph];
        if (originalAttribute.isInterleavedBufferAttribute) {
          const interleavedAttribute = originalAttribute;
          const interleavedBuffer = interleavedAttribute.data;
          const group = interleavedBufferAttributeMap.get(interleavedBuffer) ?? [];
          interleavedBufferAttributeMap.set(interleavedBuffer, group);
          group.push([attributeName, iMorph, interleavedAttribute]);
        } else {
          const attribute = originalAttribute;
          nonInterleavedAttributes.push([attributeName, iMorph, attribute]);
        }
      }
    }
    return [interleavedBufferAttributeMap, nonInterleavedAttributes];
  }
  function reorganizeMorphAttributes(newGeometry, morphAttributes, newIndexOriginalIndexMap) {
    let allMorphsAreZero = true;
    const [interleavedBufferAttributeMap, nonInterleavedAttributes] = collectMorphAttributeGroups(morphAttributes);
    const newMorphAttributes = {};
    for (const [interleavedBuffer, attributesInGroup] of interleavedBufferAttributeMap) {
      const originalInterleavedBufferArray = interleavedBuffer.array;
      const { stride } = interleavedBuffer;
      const [newInterleavedArray, isAllZero] = remapAttributeArray(
        originalInterleavedBufferArray,
        newIndexOriginalIndexMap,
        stride
      );
      allMorphsAreZero = allMorphsAreZero && isAllZero;
      const newInterleavedBuffer = new InterleavedBuffer(newInterleavedArray, stride);
      newInterleavedBuffer.setUsage(interleavedBuffer.usage);
      for (const [attributeName, morphIndex, attribute] of attributesInGroup) {
        const { itemSize, offset, normalized } = attribute;
        const newAttribute = new InterleavedBufferAttribute(newInterleavedBuffer, itemSize, offset, normalized);
        newMorphAttributes[attributeName] ?? (newMorphAttributes[attributeName] = []);
        newMorphAttributes[attributeName][morphIndex] = newAttribute;
      }
    }
    for (const [attributeName, morphIndex, attribute] of nonInterleavedAttributes) {
      const originalAttribute = attribute;
      const originalAttributeArray = originalAttribute.array;
      const { itemSize, normalized } = originalAttribute;
      const [newAttributeArray, isAllZero] = remapAttributeArray(
        originalAttributeArray,
        newIndexOriginalIndexMap,
        itemSize
      );
      allMorphsAreZero = allMorphsAreZero && isAllZero;
      newMorphAttributes[attributeName] ?? (newMorphAttributes[attributeName] = []);
      newMorphAttributes[attributeName][morphIndex] = new BufferAttribute(newAttributeArray, itemSize, normalized);
    }
    newGeometry.morphAttributes = allMorphsAreZero ? {} : newMorphAttributes;
  }
  function removeUnnecessaryVertices(root) {
    const geometryMap = /* @__PURE__ */ new Map();
    root.traverse((obj) => {
      if (!obj.isMesh) {
        return;
      }
      const mesh = obj;
      const geometry = mesh.geometry;
      const originalIndex = geometry.index;
      if (originalIndex == null) {
        return;
      }
      const newGeometryAlreadyExisted = geometryMap.get(geometry);
      if (newGeometryAlreadyExisted != null) {
        mesh.geometry = newGeometryAlreadyExisted;
        return;
      }
      const { isVertexUsed, vertexCount, verticesUsed } = checkIsVertexUsed(geometry.attributes, originalIndex);
      if (verticesUsed === vertexCount) {
        return;
      }
      const { originalIndexNewIndexMap, newIndexOriginalIndexMap } = buildIndexMapsFromIsVertexUsed(isVertexUsed);
      const newGeometry = new BufferGeometry();
      copyGeometryProperties(geometry, newGeometry);
      geometryMap.set(geometry, newGeometry);
      reorganizeIndexAttribute(newGeometry, originalIndex, originalIndexNewIndexMap);
      reorganizeGeometryAttributes(newGeometry, geometry.attributes, newIndexOriginalIndexMap);
      reorganizeMorphAttributes(newGeometry, geometry.morphAttributes, newIndexOriginalIndexMap);
      mesh.geometry = newGeometry;
    });
    Array.from(geometryMap.keys()).forEach((originalGeometry) => {
      originalGeometry.dispose();
    });
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/rotateVRM0.ts
  function rotateVRM0(vrm) {
    if (vrm.meta?.metaVersion === "0") {
      vrm.scene.rotation.y = Math.PI;
    }
  }

  // ../assets_src/three-vrm/packages/three-vrm/src/VRMUtils/index.ts
  var VRMUtils = class {
    constructor() {
    }
  };
  VRMUtils.combineMorphs = combineMorphs;
  VRMUtils.combineSkeletons = combineSkeletons;
  VRMUtils.deepDispose = deepDispose;
  VRMUtils.removeUnnecessaryJoints = removeUnnecessaryJoints;
  VRMUtils.removeUnnecessaryVertices = removeUnnecessaryVertices;
  VRMUtils.rotateVRM0 = rotateVRM0;
  return __toCommonJS(entry_exports);
})();
