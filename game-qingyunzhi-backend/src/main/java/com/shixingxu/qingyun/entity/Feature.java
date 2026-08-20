package com.shixingxu.qingyun.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 玩法特色实体。
 */
@Data
@TableName("feature")
public class Feature implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 特色标题 */
    private String title;

    /** 一句话概述 */
    private String summary;

    /** 详细描述 */
    private String description;

    /** 图标符号 */
    private String icon;

    /** 排序值 */
    private Integer sort;

    /** 状态：1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
